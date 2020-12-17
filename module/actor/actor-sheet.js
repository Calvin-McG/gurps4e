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
				fieldValue = "data.reserves.fp.value";
				value = change + this.actor.data.data.reserves.fp.value;
				this.actor.setConditions(value, fieldValue);
				break;
			case "hp":
				fieldValue = "data.reserves.hp.value";
				value = change + this.actor.data.data.reserves.hp.value;
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
	// _onRoll(event) {
	// 	event.preventDefault();
	// 	const element = event.currentTarget;
	// 	const dataset = element.dataset;
	//
	// 	const executeRoll = (roll, renderer) => {
	// 		roll.roll();
	// 		const flavor = dataset.label || null;
	// 		renderer.render(roll, { template: 'systems/gurps4e/lib/gurps-foundry-roll-templates/templates/roll.html' }, { flavor }).then((html) => {
	// 			ChatMessage.create({ content: html, speaker: ChatMessage.getSpeaker({ actor: this.actor }), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
	// 		});
	// 	}
	//
	// 	const executeSuccessRoll = modList => {
	// 		const trait = dataset.trait || null;
	// 		executeRoll(SuccessRoll.fromData({ level: dataset.level, trait, modList }), new SuccessRollRenderer());
	// 	};
	//
	// 	const prepareModList = mods => mods.map(mod => ({ ...mod, modifier: parseInt(mod.modifier, 10) })).filter(mod => mod.modifier !== 0);
	//
	// 	const modList = prepareModList([
	// 		{ modifier: 0, description: 'global modifier' },
	// 		(dataset.type === 'defense') ? { modifier: 0, description: 'DB' } : { modifier: 0, description: '' }
	// 	]);
	//
	// 	if (dataset.type === 'skill' || dataset.type === 'defense') {
	// 		executeSuccessRoll(modList);
	// 	} else if (dataset.type === 'damage') {
	// 		const rollMatch = dataset.roll.match(/^([1-9][0-9]*)d6([+-][0-9]+)?$/);
	// 		executeRoll(DamageRoll.fromData({dice: rollMatch[1], adds: rollMatch[2] || '', modList}), new DamageRollRenderer());
	// 	} else {
	// 		console.log("Rollable element triggered with an unsupported data-type (supported types are 'skill', 'damage' and 'defense'");
	// 	}
	//
	// 	this.actor.update({ ["data.gmod.value"]: 0 });
	// }

	/**
	 * Handle clickable rolls.
	 * @param {Event} event	 The originating click event
	 * @private
	 */
	_onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type === 'skill' || dataset.type === 'defense') {
			let effectiveSkill = dataset.level;
			let skillRoll = new Roll("3d6");
			skillRoll.roll();
			let margin = effectiveSkill - skillRoll.total;
			let html = "<div>" + dataset.label + "</div>";

			if (skillRoll.total == 18){//18 is always a crit fail
				html += "<div>Automatic Crit Fail by " + margin + "</div>"
			}
			else if (skillRoll.total == 17){//17 is a crit fail if effective skill is less than 16, autofail otherwise
				if (effectiveSkill < 16){//Less than 16, autocrit
					html += "<div>Automatic Crit Fail by " + margin + "</div>"
				}
				else {//Autofail
					html += "<div>Automatic Fail by " + margin + "</div>"
				}
			}
			else if (margin <= -10){//Fail by 10 is a crit fail
				html += "<div>Crit Fail by " + margin + "</div>"
			}
			else if (margin < 0){//Fail is a fail
				html += "<div>Fail by " + margin + "</div>"
			}
			else if (skillRoll.total == 3 || skillRoll.total == 4){//3 and 4 are always a crit success
				html += "<div>Automatic Critical Success by " + margin + "</div>"
			}
			else if (skillRoll.total == 5 && effectiveSkill == 15){//5 is a crit if effective skill is 15
				html += "<div>Critical Success by " + margin + "</div>"
			}
			else if (skillRoll.total == 6 && effectiveSkill == 16){//6 is a crit if effective skill is 16
				html += "<div>Critical Success by " + margin + "</div>"
			}
			else if (margin >= 0){//Regular success
				html += "<div>Success by " + margin + "</div>"
			}
			else {//Wtf?
				html += "<div>Unknown result by " + margin + "</div>"
			}

			ChatMessage.create({ content: html, user: game.user._id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
		}

		else if (dataset.type === 'damage') {
			let damageRoll = new Roll(dataset.roll);
			damageRoll.roll();
			let html = "<div>" + dataset.label + " <i class='fas fa-arrow-right'></i> " + damageRoll.total + "</div>";
			ChatMessage.create({ content: html, user: game.user._id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
		}

		else {
			console.log("Rollable element triggered with an unsupported data-type (supported types are 'skill', 'damage' and 'defense'");
		}

		this.actor.update({ ["data.gmod.value"]: 0 });
	}

}
