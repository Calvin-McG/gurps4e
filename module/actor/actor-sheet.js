import { rollHelpers } from '../../helpers/rollHelpers.js';

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
			width: 780,
			height: 780,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
		});
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Update Inventory Item
		html.find('.item-edit').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		// Delete Inventory Item
		html.find('.item-delete').click(ev => {
			let confirmationModal = new Dialog({
				title: "Are you sure?",
				content: "<div style='width: 100%; text-align: center'>Are you sure?</div>",
				buttons: {
					delete: {
						icon: '<i class="fas fa-trash"></i>',
						label: "Delete",
						callback: () => {
							const li = $(ev.currentTarget).parents(".item");
							const item = this.actor.items.get(li.data("itemId"));
							item.delete();
							li.slideUp(200, () => this.render(false));
						}
					},
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: "Cancel",
						callback: () => {}
					},
				},
				default: "cancel",
				render: html => console.info("Register interactivity in the rendered dialog"),
				close: html => console.info("This always is logged no matter which option is chosen")
			},{
				resizable: true,
				width: "250"
			})

			confirmationModal.render(true);
		});

		// Rollable checks.
		html.find('.rollable').click(this._onRoll.bind(this));

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

	_onUnspentPointsChange(event) {
		let unspent = event.target.value;
		this.actor.setTotalPoints(unspent);
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
			default: "mod",
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
			rollHelpers.skillRoll(dataset.level, modifier, dataset.label, true);
		}

		else if (dataset.type === 'damage') {
			let damageRoll = new Roll(dataset.level);
			damageRoll.roll({async: true}).then( result => {
				let html = "<div>" + dataset.label + "</div>";
				let adds = 0;

				html += "<div>";
				if(damageRoll.terms[0].results){
					let diceTotal = 0;
					if(damageRoll.terms[0].results.length){//Take the results of each roll and turn it into a die icon.
						for (let k = 0; k < damageRoll.terms[0].results.length; k++){
							html += rollHelpers.dieToIcon(damageRoll.terms[0].results[k].result)
							diceTotal += damageRoll.terms[0].results[k].result;
						}
					}
					adds = (+damageRoll._total - +diceTotal);
				}
				else {
					adds = +damageRoll._total;
				}

				if (adds >= 0){//Adds are positive
					html += "<label class='damage-dice-adds'>+</label><label class='damage-dice-adds'>" + adds + "</label>"
				}
				else {//Adds are negative
					html += "<label class='damage-dice-adds'>-</label><label class='damage-dice-adds'>" + Math.abs(adds) + "</label>"
				}

				html += "</div>";

				html += "<div>Total Damage: " + damageRoll.total + "</div>";

				ChatMessage.create({ content: html, user: game.user.id, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
			})
		}

		else {
			console.log("Rollable element triggered with an unsupported data-type (supported types are 'skill', 'damage' and 'defense'");
		}
	}
}
