import { Decoration, WidgetType } from "@codemirror/view";
import InfluxFile from '../InfluxFile';
import InfluxReactComponent from '../InfluxReactComponent';
import * as React from "react";
import { createRoot } from "react-dom/client";

try {
    customElements.define("influx-element", class extends HTMLElement {
        disconnectedCallback() {
            this.dispatchEvent(new CustomEvent("disconnected"))
        }
    })
}
catch (e) {
    // console.warn('disconnect-element allready defined?')
}



interface InfluxWidgetSpec {
    influxFile: InfluxFile;
    show: boolean;
}


export class InfluxWidget extends WidgetType {
    protected influxFile
    protected show

    constructor({ influxFile, show }: InfluxWidgetSpec) {
        super()
        this.influxFile = influxFile
        this.show = show

    }

    eq(influxWidget: InfluxWidget) {
        /** Only changes within the same host document flow to this diffing point.
         * Changes to title of document is not caught.
         * Changes to other documents that are referenced in the influx of host file are not caught.
         * Therefore: Bypass this eq-check.
        */
        // return true
        // return influxWidget.influxFile?.file?.path === this.influxFile?.file?.path

        // fail eq check if show is different
        return true
    }

    toDOM() {
        const container = document.createElement("influx-element")
        container.addEventListener("disconnected", () => this.unmount(this.influxFile))
        container.id = 'influx-react-anchor-div'
        const reactAnchor = container.appendChild(document.createElement('div'))
        const anchor = createRoot(reactAnchor)
        if (this.show) {
            anchor.render(<InfluxReactComponent
                key={Math.random()}
                influxFile={this.influxFile}
                preview={false}
                sheet={this.influxFile.influx.stylesheet}
            />);
        }
        else {
            anchor.render(null)
        }

        return container
    }


    unmount(influxFile: InfluxFile) {
        this.influxFile.influx.deregisterInfluxComponent(influxFile.uuid)
    }
}


export const influxDecoration = (influxWidgetSpec: InfluxWidgetSpec) =>  Decoration.widget({
            widget: new InfluxWidget(influxWidgetSpec),
            side: influxWidgetSpec.influxFile.api.getSettings().influxAtTopOfPage ? 0 : 1,
            block: true,
        })
    