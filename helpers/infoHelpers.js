
export class infoHelpers {

    static returnActorInfo(id) {
        let info = "";
        if (id === "craft-type") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Amphibious vehicles should be statted as land.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "vehicle-method") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Pick & Modify - Select a stock GURPS vehicle and then apply upgrades and other modifications.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Full Custom - Create a vehicle from scratch</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "tl-filter") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>There are a lot of vehicles in the list. This helps you narrow things down by filtering on the TL, but otherwise has no mechanical impact.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "base-vehicle-name") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Listed here should be every vehicle of the type you have selected, within the TL range you specify. Pick the one you wish to apply modifications to.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "vehicle-personal-name") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>The specific name of this vehicle. Something like \"Korbit's Mom's Shaggin' Waggin'\"</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "vehicle-class-name") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>The name of the vehicle's class. So while it might be called \"Korbit's Mom's Shaggin' Waggin'\", the class name would be something like \"VW Van with Matress\".</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "sthp") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>The ST/HP value for the vehicle and any accompanying special code applied to the ST/HP stat. </p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Unpowered vehicles (†) have no innate ST, but their HP still applies, and are Homogenous instead of Unliving.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "hndSr") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Handling is a bonus to all control rolls. It also serves as the basis of a Vehicular Dodge, which is half skill plus Hnd.</p>" +
                "<p>+2 is quite uncommon, mostly reserved for sports bikes and very agile watercraft.</p>" +
                "<p>+1 is somewhat uncommon, mostly reserved for motorbikes and agile sports cars.</p>" +
                "<p>0 is the standard.</p>" +
                "<p>-1 is for vehicles with somewhat poor handling, like certain vans, trucks, etc.</p>" +
                "<p>-2 is for large vehicles with very poor handling, like a bus or some armoured vehicles.</p>" +
                "<p>-3 is for very large or primitive vehicles, like wagons, or cargo vessels.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Stability rating is the margin by which a mistake is considered minor, and amounts to a skid or an error that slows you down." +
                " Failing by more than your SR is often bad enough to cause a crash.</p>" +
                "<p>Generally, but not always, a vehicle with poor handling will have high stability, while low stability vehicles have high handling.</p>" +
                "<p>2 is generally the minimuim stability rating, and applies to motorcycles and some aircraft.</p>" +
                "<p>5 is generally the maximum stability rating, applying to semi-trucks and some armoured vehicles.</p>" +
                "<p>Even higher stability ratings are possible, but these are almost all large watercraft.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "vehicleHT") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Powered vehicles are generally HT 11, unpowered ones generally HT 12.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>You can type whatever you like into the HT Code box, but the only valid inputs are c, f, and x, or to leave it empty. Casing doesn't matter.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"

            info += "<table>";

            info += "<tr>" +
                "<td style='padding: 0 1em;'>C</td>" +
                "<td>Combustible, see B136 Fragile (Combustible). Vehicles made of wood, large quantities of cloth or paper, or other materials that can burn are combustible.</td>" +
                "</tr>";

            info += "<tr>" +
                "<td style='padding: 0 1em;'>F</td>" +
                "<td>Flammable, see B137 Fragile (Flammable). Vehicles that contain fuel, hydrogen, or the like are usually flammable, but not always. " +
                "The sample HMMWV obviously has a fuel tank, but as a military vehicle it's protected in such a way that the vehicle is not treated as flammable.</td>" +
                "</tr>";

            info += "<tr>" +
                "<td style='padding: 0 1em;'>X</td>" +
                "<td>Explosive, see B137 Fragile (Explosive). Vehicles that contain large quantities of ammunition are usually explosive, but not always. " +
                "A Panzer IV is treated as explosive due to the large quantity of ammunition carried inside. A Sherman is not considered explosive, as while it also carries " +
                "a large quantity of ammunition, the vehicle is designed to guard against ammunition explosions.</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "moveInput") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>From left to right: Acceleration / Move [Code].</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Acceleration is the amount by which the driver can change velocity each turn. " +
                "If you're entering values out of a GURPS book, this is the value before the slash. " +
                "If you're trying to copy an existing vehicle, find the 0 to 60 time and divide it by 8.</p>" +
                "<p>Move is the top speed of the vehicle in yards per second. " +
                "If you're entering values out of a GURPS book, this is the value after the slash. " +
                "If you're trying to copy an existing vehicle, find the top speed and divide by 2. Round down.</p>" +
                "<p>Code denotes road and rail vehicles. A road vehicle can go off-road of course, it's just quite a lot slower.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "lwt") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>In real life the term often used is Gross Vehicle Weight Rating (GVWR), and is the combined weight of the vehicle," +
                " any possible cargo, and a full fuel tank.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "load") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>In real life the term often used is Payload, and is the maximum possible weight of cargo, not including space dedicated to passengers.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "empty-weight") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Given the above values, this is the resulting empty weight of the vehicle.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>In real life this is called the Curb weight or Tare weight.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "crew-passengers") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Crew are people driving, manning mounted weapons, or otherwise integral to the operation of the vehicle.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Passengers are everyone else. This is not a hard cap, and additional people can travel in the vehicle in place of 0.1 cargo. " +
                "Alternately, passenger slots can be traded for an extra 0.1 cargo each.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"

            info += "<table>";

            info += "<tr>" +
                "<th colspan='2'>Occupancy Codes</th>" +
                "</tr>";

            info += "<tr>" +
                "<td>S</td>" +
                "<td>Sealed</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>P</td>" +
                "<td>Pressure Support</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>V</td>" +
                "<td>Vacum Support</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>A</td>" +
                "<td>Long term accommodations</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "sm") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Generally this will actually be 1 step higher than the length of the vehicle would suggest due to its boxy shape.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "range") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>This is the distance a vehicle can cover with a full load of fuel.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Other valid entries are 'FP' for vehicles drawn by animals, or '-' for vehicles with infinite range.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "base-cost") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>The base cost of the vehicle before applying any modifer which includes a Cost Factor.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "locations") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>This is a list of locations, formatted the same as GURPS does it. See Basic 462 and 463 for reference.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>When you have multiple of a location, put the digit before the letter. For example, W is for a wheel, and X is for an external weapon mount. So X4W is a four-wheeled vehicle with a single weapon mount.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "travel-distance") {
            info = "<table>" +
                "<tr>" +
                "<td><p>Select the type and number of units. Units are arranged in order of size.</p></td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "travel-hours") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>The number of hours per day you're underway. For naval or air vessels this should be 24 hours a day.</p>" +
                "<p>For ground vehicles this should be 8 hours a day, but you can push it as high as 16 hours a day</p>" +
                "<p>Vehicles drawn by draft animals need to stop for 1.3 hours after each 8 hour leg to rest. This is factored into the calculation, and is why you might not be able to enter values between 8 and 9.3</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "travel-costs") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>An itemized lists of costs, including the impact of your provisions on the remaining cargo space in the ship.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "travel-time") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>This is the travel time, broken down by terrain type or wind direction if applicable.</p>" +
                "<p>It also accounts for the fact that only air and naval vessels travel 24 hours a day.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "travel-terrain-quality") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>For ground vehicles, specify the type of terrain you will be moving over.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-chase-handling") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>Per Action 2: Page 34.</p>" +
                "<p>Handling directly modifies Chase rolls.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-chase-speed-bonus") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>Per Action 2: Page 34.</p>" +
                "<p>The vehicle's top speed gives a bonus to Chase rolls, based on that top speed compared against the SSR Table's 'Size' column.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-chase-effective-move") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>This is your effective acceleration and move on the given terrain.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-chase-effective-top-speed") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>This is your top speed on the given terrain.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "chase-wind-condition") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>For wind powered vehicles, traveling against the wind generally slows you down to about half your normal speed. " +
                "What 'With' and 'Against' means varies per vehicle though. Large square rigged ships probably consider themselves to be against the wind at anything greater than 45 degrees, while " +
                "Xebecs and other ships with wing-like sails could travel at full speed even at 135 degrees to the wind.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "simple-vehicle-sailing") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>Sailing vessels have two speeds, one when under sail, and another for their non-sailing movement.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "simple-vehicle-naval-powered-move") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>These are your movement values when using your non-sailing propulsion. That might mean oars, or a nuclear powerplant.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-thr") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>This is your vehicle's thrust stat, used in Ram maneuvers and wipeouts.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "base-vehicle-ref") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>This is where you can find the base vehicle's book entry.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-stall") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>An aircraft must maintain this minimum speed or begin to stall. A stall of 0 means the vehicle can hover in place.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-deceleration-safe") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>This is the amount by which you can decelerate without it requiring a control roll.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-deceleration-max") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>This is the maximum deceleration your vehicle is capable of. " +
                "Attempting it requires a control roll with penalties as described in Basic 395 'Pushing The Envelope'</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "travel-cruising-speed") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>Ground vehicles generally don't spend their whole time at top speed. " +
                "Cruising speed is your base move divided by 1.6</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-draft") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>This is your vehicle's depth below the water-line in feet.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "travel-crew-wealth") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>The average wealth level being paid to the crew. Only impacts travel costs.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "travel-crew-tech") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>This only impacts the amount the crew is being paid, and has nothing to do with their ability to operate the vehicle.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "simple-vehicle-naval-sail-move") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>These are your movement values when using your sails.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "vehicle-chase-total-mod") {
            info = "<table>" +
                "<tr>" +
                "<td>" +
                "<p>Only includes modifiers intrinsic to the vehicle, not any bonuses from Area Knowledge or special maneuvers.</p>" +
                "</td>" +
                "</tr>" +
                "</table>"
        }
        else if (id === "dr-method") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Single Value - Use a single DR value for all facings and hit locations. Windows, if present, will have the default DR 2.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Facing - Set DR by facing, including the top and bottom of the vehicle. Windows, if present, will have the default DR 2.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Single Plus - Use a single base DR value for the whole vehicle, with some locations having separate DR as well</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Facing Plus - Set DR by facing, and optionally by location as well</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "dr-single") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Vehicles don't vary DR based on the wound modifier. Windows, if present, don't use this value for DR. They instead have the default DR 2.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "dr-facing") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Enter the DR by facing. If the vehicle includes a window hit location, it will also appear here.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "propulsion") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Powered vehicles are almost always Unliving, but have Vitals</p>" +
                "<p>Unpowered vehicles are almost always Homogenous, and so don't have Vitals</p>" +
                "<p>Sailing vehicles are almost always Homogenous, and so don't have Vitals, but damage to the Mast will slow or stop it.</p>" +
                "<p>Vehicles propelled by animals are almost always Homogenous, and don't have Vitals, but the animals themselves can be damaged or killed.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "animal-location") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Vehicles pulled by animals generally use Teamster to drive them, and the animals lack DR unless it's worn as equipment.</p>" +
                "<p>Vehicles with animals internal to the vehicle get the benefit of DR, though they're generally heavier and more expensive.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "animal-type") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>The animal type determines the specialty of Teamster, such as Teamster (Equine), which is used to operate the vehicle. " +
                "The actual animals themselves should be attached as separate characters, much like assigning someone as a driver or passenger.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "expected-injury-tolerance") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Leaving this box checked gives you the default injury tolerance for a vehicle with its propulsion type.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "motive-type") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Listed here are all possible motive types for your vehicle, based on the locations you've provided.</p>" +
                "<p>Here we're only really concerned with the effects of damage on the vehicle's hit locations, not including any possible engine damage.</p>" +
                "<p>For example, if your vehicle has both wheels and tracks, but you pick 'wheeled', then damage to the tracks will not impact movement in any way. " +
                "But on the other hand, they won't provide any support either and damage to individual wheels will have a more significant impact on your movement. " +
                "The same is true if you were to pick tracks only.</p>" +
                "<p>On the other hand, if you were to pick both tracks and wheels, then damage to either location would have an impact on movement. But the loss of any one " +
                "location would not be so severe.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Motive type also limits the list of operator skills you can select from lower down on the sheet.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Immune is used for cases where there is not a specific location on the vehicle which can reduce movement if destroyed. " +
                "For example, a magically propelled flying carpet would be classified as 'Immune', but so would a Motorboat or Battleship. " +
                "And if you're wondering, 'Well what about the engine?' that's part of the body/vitals hit location.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Immune should also be used for most Sailing vehicles. Exceptions would be something like an ice yacht which has Runners that can be destroyed.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "pneumatic") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Pneumatic tires, like those on a car, can be punctured. If the wheel takes any damage, roll vs HT. On a failure the wheel gets a puncture which cripples it until changed.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Losing one gives ‑4 to Hnd and -50% to Top Speed; losing two or more stops the vehicle.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "run-flat") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Having run-flat tires will cap the penalty for punctured tires at ‑1 to Hnd and ‑20% to Top Speed, no matter how many are damaged.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "operation-skill") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>This is the skill used by the vehicle's principle operator. If it's something small like a car, that just means the driver. " +
                "If it's something big like a battleship, it's the skill the captain uses. Generally some variant of Shiphandling (B220).</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "crewed") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>A motorboat is not a crewed vessel, a battleship is. A hot air baloon is not a crewed vessel, a zepplin is.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "crew-skill") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>If your vehicle requires crew to keep it working, other than to man weapons, this is the skill they use. Generally some variant of Crewman (B185)</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "road-bound") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Road bound vehicles can travel off-road, but at a much reduced speed. Like a normal passenger car trying to drive across a field.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "placeholder") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>This is a placeholder info section.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "location-has-passengers") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Setting this true lets actors sit in this part of the vehicle.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "location-passenger-count") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>If you have multiple instances of a location, this is the maximum number of passengers who can fit in each of them.</p>" +
                "<p>If you only have the one location, this is how many people it fits.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "location-has-crew") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Setting this true lets actors sit in this part of the vehicle.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "location-crew-count") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>If you have multiple instances of a location, this is the maximum number of passengers who can fit in each of them.</p>" +
                "<p>If you only have the one location, this is how many people it fits.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "count-stab") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Normally when firing from a vehicle the combined bonuses from aiming (Accuracy, extra turns of Aim, targeting systems, and bracing) cannot exceed the vehicle's stability rating. " +
                "This cap also applies before any penalties are deducted.</p>" +
                "<p>Stabalized weapon mounts remove this bonus cap.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        else if (id === "retractable") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Retracted locations are hidden and cannot be targetted.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }

        return info;
    }
}
