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
			width: 565,
			height: 615,
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

		// track and handle changes to HP and FP
		html.find('.sec-attr').change(this._onSecondaryAttributeChange.bind(this));

		// Accordion handlers
		//html.find('.accordion').click(this._onAccordionToggle.bind(this));
		html.find('.accordion').click(this._onAccordionToggle.bind(this));

		// Track changes to unspent points
		html.find('.unspentEntry').change(this._onUnspentPointsChange.bind(this));

	}

	/* -------------------------------------------- */

	_onAccordionToggle(event) {
		event.preventDefault();
		let rows = document.getElementsByClassName("accordion-div-" + event.target.id.substr(22))
		for (let y = 0; y < rows.length; y++){
			if(rows[y].classList.contains("accordion-open")){//It's open, close it
				rows[y].classList.remove("accordion-open")
				rows[y].classList.add("accordion-closed")
			}
			else {//It's closed, open it
				rows[y].classList.add("accordion-open")
				rows[y].classList.remove("accordion-closed")
			}
		}
	}

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
	_onRoll(event) {
		event.preventDefault();

		let modModal = new Dialog({
			title: "Modifier Dialog",
			content: "<input type='text' id='mod' name='mod' value='0'/>",
			buttons: {
				mod: {
					icon: '<i class="fas fa-check"></i>',
					label: "Apply Modifier",
					callback: (html) => {
						let mod = html.find('#mod').val()
						this.computeRoll(event, mod)
					}
				},
				noMod: {
					icon: '<i class="fas fa-times"></i>',
					label: "No Modifier",
					callback: () => this.computeRoll(event, 0)
				}
			},
			default: "noMod",
			render: html => console.log("Register interactivity in the rendered dialog"),
			close: html => console.log("This always is logged no matter which option is chosen")
		})
		modModal.render(true)
	}

	computeRoll(event, modifier){
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		if (dataset.type === 'skill' || dataset.type === 'defense') {
			let effectiveSkill = +dataset.level + +modifier;
			let die1 = new Roll("1d6");
			let die2 = new Roll("1d6");
			let die3 = new Roll("1d6");

			die1.roll();
			die2.roll();
			die3.roll();
			let skillRoll = +die1.total + +die2.total + +die3.total;
			let margin = +effectiveSkill - +skillRoll;
			let html = "<div>" + dataset.label + "</div>";

			if(modifier >= 0){//modifier is zero or positive
				html += "Rolls a " + skillRoll + " vs " + dataset.level + " + " + modifier;
			}
			else {
				html += "Rolls a " + skillRoll + " vs " + dataset.level + " - " + modifier;
			}

			//Code block for display of dice
			html += "<div>";
			html += this.dieToIcon(die1.total);
			html += this.dieToIcon(die2.total);
			html += this.dieToIcon(die3.total);
			html += "</div>"


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
			let damageRoll = new Roll(dataset.level);
			damageRoll.roll();
			let html = "<div>" + dataset.label + "</div>";

			html += "<div>";

			if(damageRoll.terms[0].results.length){//Take the results of each roll and turn it into a die icon.
				for (let k = 0; k < damageRoll.terms[0].results.length; k++){
					html += this.dieToIcon(damageRoll.terms[0].results[k].result)
				}
			}

			let adds = (+damageRoll._total - +damageRoll.results[0]);

			if (adds >= 0){//Adds are positive
				html += "<label class='damage-dice-adds'>+</label><label class='damage-dice-adds'>" + adds + "</label>"
			}
			else {//Adds are negative
				html += "<label class='damage-dice-adds'>-</label><label class='damage-dice-adds'>" + Math.abs(adds) + "</label>"
			}

			html += "</div>";

			html += "<div>Total Damage: " + damageRoll.total + "</div>";

			ChatMessage.create({ content: html, user: game.user._id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
		}

		else {
			console.log("Rollable element triggered with an unsupported data-type (supported types are 'skill', 'damage' and 'defense'");
		}
	}

	dieToIcon(die){
		let response = "";
		switch (die) {
			case 1:
				response = "<label class=\"fa fa-dice-one fa-4x\"></label>";
				break;
			case 2:
				response = "<label class=\"fa fa-dice-two fa-4x\"></label>";
				break;
			case 3:
				response = "<label class=\"fa fa-dice-three fa-4x\"></label>";
				break;
			case 4:
				response = "<label class=\"fa fa-dice-four fa-4x\"></label>";
				break;
			case 5:
				response = "<label class=\"fa fa-dice-five fa-4x\"></label>";
				break;
			case 6:
				response = "<label class=\"fa fa-dice-six fa-4x\"></label>";
				break;
			default:
				break;
		}

		return response;
	}

}
