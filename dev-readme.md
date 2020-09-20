GURPS Project for Foundry VTT

Goals
- The primary goal of this project is to permit people to play GURPS online as easily as if they were sitting around a table. The facts of digital displays and simplification of many actions through automation will permit much more but are a stretch goal rather than the primary one.
- A secondary goal is to be able to play as much as possible while acting through a token on the playing surface. This minimizes clutter and will likely speed up or smooth play.
- A secondary goal is that, should someone need to open a sheet, all of the things they need to interact with to perform a frequent action are on the main tab. The front tab becomes a display of all the clickable things you have chosen to be there. Other tabs hold the actual, editable items with full details.
- A tertiary goal is that ready-made characters be able to be imported into the sheet from a recognised character generator output. Whether this is a JSON input format to which any character generator may create an output, or an input of raw GCS files, is up for discussion.

General Design Notes
- Do not try to display all information about an object, just enough to be useful for reference or to identify it among its' peers. Employ a means to see detailed information about a summarized object by interacting with it in some way that takes positive action; like the Foundry chat tooltip behavior. 
- Localisation is to be employed for all system-generated labels.
- Code organisation. Follow the pattern of WFRP in general. Hooks are to be given their own files so that all actions taking place because of them are consolidated.

Works in Progress
- the Size Speed Range ruler module by Exxar
	- is now integrated in ./lib
	- a revision will allow storage of a (modifier, name) pair by the sheet
		- suggested behaviour was storage of accumulated distance on every click

- Hotkey Movement model - Exxar is working on it
	- make it possible to override the default Foundry movement model so that the leftmost keys or number keypad may be used to move a token: forward, backward, turn right, turn left, sidestep forward right and left and sidestep rearward both right and left.
	- need to be careful of existing hotkeys suppported by Foundry
		- note that existing settings have the token facing downscreen by default
	- eventually would like to be able to track the number of hexes moved thus far.
		- system setting for RAW tracking of turns or just hexes
		- reset as the token reaches the top of the combat tracker
		- reset to origin on request

- the Roll Library and Rendering by Exxar
	- is now integrated in ./lib
	- would like to create a folder in templates for roll templates
		- make these selectable in a system setting for minimal, normal and newbie modes
	- Exxar has reworked the roller to accept roll data with (modifier, name) pairs which may then be rendered
		- the sheet must collect them and hand them to the roller (see Modifiers below)
			- this works for the front tab except for damage modifiers (which he is sorting)
		- the internal calls are different for the front tab and item versions of the same thing (perhaps a refactor to synchronise them is in order)


Action processing
- currently one sets the gmod then rolls the attack, defence, check or skill.
	- this will continue to be possible and augmented by further options as the roll-library is fully integrated
- another process needs implementation where:
	- the roll is initiated and a dialog specific to the roll type is presented
	- the gmod is top of the list of user-definable modifiers also filtered for the roll type
	- the user selects the appropriate modifiers and rolls.
	- this process may be preceded by a macro where the action and target are selected
		- there would be a different macro for each type of process to minimise user-actions required
- yet another view of this process where:
	- We present the dialog which:
		- has the skill list for the token actor
		- has the modifier list for the token and skills
		- has the selected target token (advanced option)
	- We select the skill
	- select all the appropriate modifiers
	- uncheck the target if necessary (or select a target - like Roll20)
	- make the roll

Item possibilities
- Items have been expanded to permit a variety of effects but much work still needs to be done
- General
	- Items may be dropped onto a sheet and will be displayed on a sheet filtered for their type
	- An item will display basic information to uniquely identify it until selected to display detailed information
	- An item should be able to be edited from the detail view and not need to be opened in an editor dialog
	- An item will have a toggle to determine if it will be placed on the front tab
		- a summary of all rollable information is presented in the appropriate section on the main tab. Details to be discussed for each item type.
- Modifiers
	- A modifier will be an item (except perhaps for system modifiers, TBD)
	- must know to which rolls it may apply
	- may be active or inactive (so it is not included in presented options)
	- need not be on the front sheet in order to be active
		- useful for the roll dialog box method of processing actions.
- Semi-Intelligent items
	- do we want to include base attribute and difficulty for rollable items so they may automatically calculate their level when added?
		this is awfully close to full calculation.
	- can we intercept the drop action and have the user set the initial values for the item on drop?
- Containers
	- Traits should be containers of modifiers
- References
	- Hard-to-Kill gives a bonus to Death saves/checks
	- can we create a tag for the modifier contained by Hard-to-Kill that can be caught by a filter for a Death check?
- Checks: Knockdown and Stun, Consciousness, Death, Fright, Stun Recovery for example
	- Is there a finite list of these that we can create in advance so that references can be made for them?
	- Should we simply build a framework inside which they may be created and references generated as well?

Macro options for a selected token
- each type of action possible to be taken by an actor should be accessible through a macro
	- select a target then choose the attack macro and a dialog appears to select which one from the list of attacks owned by the actor associated with the token.
	- or start the macro, select from the list of actor actions of that type available, then choose a target or targets (area effect?) to generate the type-specific dialog to prompt for modifiers. If this can be done dynamically in a single dialog, that would be prefereable perhaps.
	- skills, techniques, spells and ritual magic spells would act in the same fashion.
- discuss the possibility of triggering the target to choose an active defence in response to a successful attack. Maybe some interaction by dragging chat results to a token?

Modifiers (may be redundant or contradictory statements here as this was written first)
- currently there are two modifiers:
	- gmod - the global modifier which applies to every roll, and is reset afterwards
	- dmod - the defensive bonus modifier representing the db of a shield which is applied to every active defence roll.
- there are two types of modifiers desired in the near future:
	- conditions or status modifiers for RAW conditions or status effects. These are things like stunned, surprised, reeling and tired. Postures should also be included in the list. Shock penalties may end up here to or in the next group, uncertain for now.
		- need to be careful to retain edition-neutrality somehow. I have some thoughts on drag and drop conditions or a global system setting like 3e/4e
	- configurable modifiers that can be toggled on or off and to reset or remain in effect after rolls. Simply a name and a value in a box with the two toggles.
	- all the modifiers for an actor could be filtered for those in effect and placed in a collection to be given to the roller or a visible box could append or remove modifiers as they are toggled so there is a visual reminder of which modifiers are currently in effect.

Drag and Drop
- it has been my preference to build the front tab to handle as much as possible so it is always quickly available to a player. If macros acting through tokens becomes reality, then this is less important.
- the sheet should allow imports from a gcs file to quickly populate a sheet
	- question gcs files need processing for rules. Do we import a specific set of gcs output templated files as well?
	- gcs processes some rules, perhaps all, including effects of equipped items.
- if everything except core data can be represented by a functional item, can we not store each item type on it's own tab but toggle the popular ones to the main tab for quick access on the sheet?
- too many conflicting choices/desires here. Need to put it aside and ponder.

Status Effect linkage
- there may be core support for this coming
- All status effects available to the token shall be supported by the sheet.
- toggle a status on the token and it is toggled on the sheet as well, thus affecting die rolls.
- some status are health or fatigue specific and should be triggered automatically.
- not sure about crippling injury being automatic based on damage to a location and system settings (house rules) selected.

Localisation
- the framework for it is in place. Expand upon it so that any system generated text is drawn from it.

Icons
- make better icons for status effects and other applications