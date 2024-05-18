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
			width: 780,
			height: 780,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
		});
	}

	/** @override */
	get template() {
		const path = "systems/gurps4e/templates/actor";
		// Return a single sheet for all actor types.
		// return `${path}/actor-sheet.html`;
		// Alternatively, you could use the following return statement to do a
		// unique actor sheet by type, like `actor-sheet.html`.

		if (this.actor.type.toLowerCase() === "fullchar") {
			return `${path}/actor-sheet.html`;
		}
		else {
			return `${path}/${this.actor.type}-sheet.html`;
		}
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

		// Track changes to the RPM core skill
		html.find('.rpmCoreSkill').change(this._onRpmCoreSkillChange.bind(this));

		html.find('.makeLearningRoll').click(this._makeLearningRoll.bind(this));

		html.find('.question-container').click(this._showHint.bind(this));
	}

	/* -------------------------------------------- */

	_showHint(event) {
		console.log(event)
		this.actor.showInfo(event.currentTarget.id);
	}
	async _makeLearningRoll() {
		rollHelpers.skillRoll(this.actor.system.info.learning.finalEffective, 0, this.actor.name + " makes a learning roll.", false).then( rollInfo => { // Make the roll

			let html = rollInfo.content;

			let hours = 150 + (rollInfo.margin * 15);

			if (rollInfo.crit) { // User got a crit
				if (rollInfo.success) { // It was a crit success
					html += "Breakthrough!";
					// By default, a crit on a learning roll sets your learning to 400 hours, but you get no benefit if you're already at or past that.
					// Instead, this logic adds 50 hours if you're at 350 or more. So 350 becomes 400 as usual, but everyone else gets a +50 hour bonus for critting.
					if (hours >= 350) {
						hours += 50;
					}
					else { // If the user wasn't anywhere close to 400 hours, still set it to 400.
						hours = 400;
					}
				}
				else { // It was a crit fail.
					html += "Overwork and collapse! Take 3d FP damage.";
				}
			}
			html += "</br>";

			hours += +this.actor.system.info.learning.extraHours; // Add back in the bonus hours.
			hours *= +this.actor.system.info.learning.style; // Apply the multiplier for learning style

			html += "You gain " + hours + " hours of training time to distribute among your skills.";

			ChatMessage.create({ content: html, user: game.user.id, type: rollInfo.type });
		});
	}

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

	_onRpmCoreSkillChange(event) {
		let skillName = event.target.value;
		this.actor.setRPMCoreSkill(skillName);
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event	 The originating click event
	 * @private
	 */
	_onRoll(event) {
		event.preventDefault();

		if (event.altKey || event.ctrlKey || event.shiftKey) { // If any modifier key were pressed.
			this.computeRollFromEvent(event, 0); // Make the roll directly without bringing up the modal.
		}
		else { // Otherwise
			let modModal = new Dialog({ // Bring up a modal to allow them to input a modifier on the roll.
				title: "Modifier Dialog",
				content: "<input type='text' id='mod' name='mod' value='0'/>",
				buttons: {
					mod: {
						icon: '<i class="fas fa-check"></i>',
						label: "Apply Modifier",
						callback: (html) => {
							let mod = html.find('#mod').val()
							this.computeRollFromEvent(event, mod)
						}
					},
					noMod: {
						icon: '<i class="fas fa-times"></i>',
						label: "No Modifier",
						callback: () => this.computeRollFromEvent(event, 0)
					}
				},
				default: "mod",
				render: html => console.log("Register interactivity in the rendered dialog"),
				close: html => console.log("This always is logged no matter which option is chosen")
			})
			modModal.render(true)
		}
	}

	computeRollFromEvent(event, modifier){
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		this.computeRollFromDataset(dataset, modifier);
	}

	// dataset comes as
	// dataset = {
	// 	label: "Makes a <b>Judo</b> roll.",
	// 	level: "12",
	// 	type: "skill"
	// }
	computeRollFromDataset(dataset, modifier){
		if (dataset.type === 'skill' || dataset.type === 'defense' || dataset.type === 'defence') {
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
