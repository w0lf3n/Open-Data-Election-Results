
import {create_data_map, init as init_d3} from "./d3_adapter.js";
import {hasProperty, isString} from "../../lib/jst/native/typecheck.js";
import {Application} from "../../lib/jst/dom/application.js";
import {Container} from "../../lib/jst/dom/container.js";
import {TextComponent} from "../../lib/jst/dom/textcomponent.js";


const map_containers = [];

/** Creates main structure of webpage with dynamic features.
 * Versatile customizable through options parameter.
 * @param {*} display_options
 */
const init = function (display_options, display_modes, data_source) {

    let title = null;
    if (hasProperty(display_options, "title") && isString(display_options.title)) {
        title = new TextComponent(display_options.title, "Title");
    }
    let subtitle = null;
    if (hasProperty(display_options, "subtitle") && isString(display_options.subtitle)) {
        subtitle = new TextComponent(display_options.subtitle, "Subtitle");
    }

    const mainHeader = new Container("MainHeader");
    mainHeader.append(title, subtitle);
    const header = new Container("AppHeader");
    header.addComponent(mainHeader);

    const body = new Container("AppBody");
    const map_container_class_names = [];
    if (hasProperty(display_options, "area") && isString(display_options.area)) {

        body.setStyle("grid-template-areas", `"${display_options.area.replace(/,/g, "\" \"")}"`);

        /** @type {Array<string>} */
        const rows = display_options.area.split(",");
        let max_cols = 0;
        rows.forEach(row => {
            const current_cols = row.split(" ");
            if (current_cols.length > max_cols) {
                max_cols = current_cols.length;
            }
            current_cols.forEach(col => {
                if (!map_container_class_names.includes(col)) {
                    map_container_class_names.push(col);
                }

            });
        });

        if (hasProperty(display_options, "cols") && isString(display_options.cols)) {
            body.setStyle("grid-template-columns", display_options.cols);
        } else {
            body.setStyle("grid-template-columns", `repeat(${max_cols}, 1fr)`);
        }

        if (hasProperty(display_options, "rows") && isString(display_options.rows)) {
            body.setStyle("grid-template-rows", display_options.rows);
        } else {
            body.setStyle("grid-template-rows", `repeat(${rows.length}, 1fr)`);
        }

    }

    map_container_class_names.forEach(class_name => {
        const map_name = new TextComponent(null, "Name");
        const map_class_name = "Map_" + class_name;
        const map_container = new Container("MapContainer " + map_class_name);
        map_container.setStyle("grid-area", class_name);
        map_containers.push({class_name: map_class_name, self: map_container, unused: true});
        map_container.addComponent(map_name);
        body.addComponent(map_container);
    });

    const app = new Application("Open Data Election");
    app.setContextMenuEnabled(false);
    app.getRootPane().append(header, body);

    init_d3(data_source || null);
};

/** Adds the map with its data to the next free map container.
 *
 * @param {Object} data
 * @param {Object} options
 */
const add_data_map = function (data, options) {

    const next_free_container = map_containers.find(container => container.unused);

    if (next_free_container) {

        let containersize = null;
        containersize = next_free_container.self.getOffsetSize();

        // "push" size object to current options
        Object.assign(options, {size: {width: containersize.width - 20, height: containersize.height - 20}});

        create_data_map(
            data,
            "." + next_free_container.class_name,
            options
        );

        next_free_container.unused = false;
    }

};


export {
    add_data_map,
    init
};
