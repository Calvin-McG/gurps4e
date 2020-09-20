import { SuccessRoll, SuccessRollRenderer, DamageRoll, DamageRollRenderer } from "../../lib/gurps-foundry-roll-lib/gurps-foundry-roll-lib.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class gurpsActorSheet extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["gurps4e", "sheet", "actor"],
			template: "systems/gurps4e/templates/actor/actor-sheet.html",
			width: 540,
			height: 600,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
		});
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		const data = super.getData();
		data.dtypes = ["String", "Number", "Boolean"];

		return data;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Add Inventory Item
		html.find('.item-create').click(this._onItemCreate.bind(this));

		// Update Inventory Item
		html.find('.item-edit').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.getOwnedItem(li.data("itemId"));
			item.sheet.render(true);
		});

		// Delete Inventory Item
		html.find('.item-delete').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			this.actor.deleteOwnedItem(li.data("itemId"));
			li.slideUp(200, () => this.render(false));
		});

		// Rollable checks.
		html.find('.rollable').click(this._onRoll.bind(this));

		// Plus - Minus check
		html.find('.plus').click(this._onPlusMinus.bind(this));
		html.find('.minus').click(this._onPlusMinus.bind(this));

		// Relative updates for numeric fields (from DnD5e)
		//inputs.find('input[data-dtype="Number"]').change(this._onChangeInputDelta.bind(this));

		// track and handle changes to HP and FP
		html.find('.sec-attr').change(this._onSecondaryAttributeChange.bind(this));


		// Track changes to unspent points
		html.find('.unspentEntry').change(this._onUnspentPointsChange.bind(this));

		// Track changes to attributes
		html.find('.atrPoints').change(this._onAttributePointsChange.bind(this));
		html.find('.atrMod').change(this._onAttributeModChange.bind(this));
	}

	/* -------------------------------------------- */


	/**
	 * Handle changes to secondary attribute number fields.
	 * @param {Event} event	 The originating change event
	 * @private
	 */
	_onSecondaryAttributeChange(event) {
		event.preventDefault();
		let value = event.target.value;
		let name = event.target.name;
		this.actor.setConditions(value, name);
	}

    _onAttributePointsChange(event) {
        event.preventDefault();
		let points = event.target.value;
		let name = event.target.name;
		this.actor.setAtrPoints(points, name);
    }

	_onAttributeModChange(event) {
		event.preventDefault();
		let mod = event.target.value;
		let name = event.target.name;
		this.actor.setAtrMod(mod, name);
	}

	_onUnspentPointsChange(event) {
		let unspent = event.target.value;
		this.actor.setTotalPoints(unspent);
	}

	/**
	 * Handle the behaviour of the plus and minus 'buttons' related to a label.
	 * @param {Event} event	 The originating click event
	 * @private
	 */
	_onPlusMinus(event) {
		event.preventDefault();
		let field = event.currentTarget.firstElementChild;
		let fieldName = field.name;
		let change = parseInt(field.value);
		var value;
		var fieldValue;

		switch (fieldName) {
			case "gmod":
				fieldValue = "data.gmod.value";
				value = change + this.actor.data.data.gmod.value;
				break;
			case "dmod":
				fieldValue = "data.dmod.value";
				value = change + this.actor.data.data.dmod.value;
				break;
			case "fp":
				fieldValue = "data.secondaryAttributes.fp.value";
				value = change + this.actor.data.data.secondaryAttributes.fp.value;
				this.actor.setConditions(value, fieldValue);
				break;
			case "hp":
				fieldValue = "data.secondaryAttributes.hp.value";
				value = change + this.actor.data.data.secondaryAttributes.hp.value;
				this.actor.setConditions(value, fieldValue);
				break;
			default:
				fieldValue = "data.attacks." + fieldName + ".seed";
				let damages = this.actor.data.data.attacks;

				for (let [id, damage] of Object.entries(damages)) {
					if (fieldName == id) {
						value = ((value = damage.seed + change) == 0) ? 1 : value;
						break;
					}
				}
		}
		this.actor.update({ [fieldValue]: value });
	}

	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event	 The originating click event
	 * @private
	 */
	_onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			data: data
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.data["type"];

		// Finally, create the item!
		return this.actor.createOwnedItem(itemData);
	}

	/**
	* Handle clickable rolls.
	* @param {Event} event	 The originating click event
	* @private
	*/
	_onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const actorData = this.actor.data.data;
		const actorMods = actorData.modifiers;

		const executeRoll = (roll, renderer) => {
			roll.roll();
			const flavor = dataset.label || null;
			renderer.render(roll, { template: 'systems/gurps4e/lib/gurps-foundry-roll-templates/templates/roll.html' }, { flavor }).then((html) => {
				ChatMessage.create({ content: html, speaker: ChatMessage.getSpeaker({ actor: this.actor }), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
			});
		}

		const executeSuccessRoll = modList => {
			const trait = dataset.trait || null;
			executeRoll(SuccessRoll.fromData({ level: dataset.level, trait, modList }), new SuccessRollRenderer());
		};

		const prepareModList = mods => mods.map(mod => ({ ...mod, modifier: parseInt(mod.modifier, 10) })).filter(mod => mod.modifier !== 0);

		const modList = prepareModList([
			{ modifier: actorData.gmod.value, description: 'global modifier' },
			(dataset.type === 'defense') ? { modifier: actorData.dmod.value, description: 'DB' } : { modifier: 0, description: '' },
			actorMods.modA.inEffect ? { modifier: actorMods.modA.value, description: actorMods.modA.label } : { modifier: 0, description: '' },
			actorMods.modB.inEffect ? { modifier: actorMods.modB.value, description: actorMods.modB.label } : { modifier: 0, description: '' },
			actorMods.modC.inEffect ? { modifier: actorMods.modC.value, description: actorMods.modC.label } : { modifier: 0, description: '' },
			actorMods.modD.inEffect ? { modifier: actorMods.modD.value, description: actorMods.modD.label } : { modifier: 0, description: '' },
			actorMods.modE.inEffect ? { modifier: actorMods.modE.value, description: actorMods.modE.label } : { modifier: 0, description: '' },
			actorMods.modF.inEffect ? { modifier: actorMods.modF.value, description: actorMods.modF.label } : { modifier: 0, description: '' },
			actorMods.modG.inEffect ? { modifier: actorMods.modG.value, description: actorMods.modG.label } : { modifier: 0, description: '' },
			actorMods.modH.inEffect ? { modifier: actorMods.modH.value, description: actorMods.modH.label } : { modifier: 0, description: '' },
			actorMods.modI.inEffect ? { modifier: actorMods.modI.value, description: actorMods.modI.label } : { modifier: 0, description: '' },
			actorMods.modJ.inEffect ? { modifier: actorMods.modJ.value, description: actorMods.modJ.label } : { modifier: 0, description: '' },
			actorMods.modK.inEffect ? { modifier: actorMods.modK.value, description: actorMods.modK.label } : { modifier: 0, description: '' },
			actorMods.modL.inEffect ? { modifier: actorMods.modL.value, description: actorMods.modL.label } : { modifier: 0, description: '' },
			actorMods.modM.inEffect ? { modifier: actorMods.modM.value, description: actorMods.modM.label } : { modifier: 0, description: '' },
			actorMods.modN.inEffect ? { modifier: actorMods.modN.value, description: actorMods.modN.label } : { modifier: 0, description: '' },
			actorMods.modO.inEffect ? { modifier: actorMods.modO.value, description: actorMods.modO.label } : { modifier: 0, description: '' },
			actorMods.modP.inEffect ? { modifier: actorMods.modP.value, description: actorMods.modP.label } : { modifier: 0, description: '' },
			actorMods.modQ.inEffect ? { modifier: actorMods.modQ.value, description: actorMods.modQ.label } : { modifier: 0, description: '' },
			actorMods.modR.inEffect ? { modifier: actorMods.modR.value, description: actorMods.modR.label } : { modifier: 0, description: '' }
		]);

		if (dataset.type === 'skill' || dataset.type === 'defense') {
			executeSuccessRoll(modList);
		} else if (dataset.type === 'damage') {
			const rollMatch = dataset.roll.match(/^([1-9][0-9]*)d6([+-][0-9]+)?$/);
			executeRoll(DamageRoll.fromData({dice: rollMatch[1], adds: rollMatch[2] || '', modList}), new DamageRollRenderer());
		} else {
			console.log("Rollable element triggered with an unsupported data-type (supported types are 'skill', 'damage' and 'defense'");
		}

		this.actor.update({ ["data.gmod.value"]: 0 });
	}

}
