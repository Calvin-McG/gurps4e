
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
        else if (id === "vehicle-name") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>The name of the vehicle</p>" +
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
        }
        else if (id === "sm") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Generally this will actually be 1 step higher than the length of the vehicle would suggest due to it's boxy shape.</p>" +
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
        else if (id === "dr-method") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>Single Value - Use a single DR value for all facings and hit locations. If the vehicle has windows, they are assumed to have the default DR 2.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Facing - Set DR by facing, including the top, bottom, and any windows.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Facing Plus - As above, but also lets you set the DR for any special locations added in the row above.</p>" +
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
        else if (id === "motive-type") {
            info = "<table>";

            info += "<tr>" +
                "<td>" +
                "<p>A vehicle might have several different possible methods of moving, but for the purpose of a GURPS Vehicle, only one counts for the stats.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>The list here includes all possible motive types, based on the locations you've selected.</p>" +
                "</td>" +
                "</tr>";

            info += "<tr>" +
                "<td>" +
                "<p>Motive type will also dictate the skill used to maneuver the vehicle.</p>" +
                "</td>" +
                "</tr>";

            info += "</table>"
        }
        return info;
    }
}
