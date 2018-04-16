/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private target: HTMLElement;
        private settings: VisualSettings;

        private copyButton: HTMLDivElement;
        private clipboardText: HTMLTextAreaElement;
        private arrValues: any;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            if (typeof document !== "undefined") {
                let b = this.copyButton = document.createElement("div");
                b.className = "btn";
                this.target.appendChild(b);
                var thisRef = this;

                var divContainer = document.createElement("div");
                this.target.appendChild(divContainer);
                let ta = this.clipboardText = document.createElement("textarea");
                divContainer.style.display = "block";
                divContainer.style.width = "0";
                divContainer.style.height = "0";
                divContainer.style.opacity = "0";
                divContainer.appendChild(ta);
                ta.innerHTML = "Första\tAndra\tTredje \r\n 1\t2\t3";


            }
        }

        private clickCopy(e, thisRef) {
            thisRef.copyButton.className = "btnClicked";
            //thisRef.copyButton.style.backgroundColor = "#000";
            //thisRef.copyButton.style.color = "#fff";
            let ext = this.arrValues.map(e=>e.join("\t")).join("\r\n");
            this.clipboardText.innerHTML = ext;
            thisRef.clipboardText.select();
            document.execCommand("copy");
            setTimeout( function() {
                thisRef.copyButton.className = "btn";
            }, 100 );
        }

        public update(options: VisualUpdateOptions) {
            this.copyButton.onclick = null;
            this.copyButton.innerText = "Loading data...";

            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

            // Get values
            let noRows = 0;
            if ( options.dataViews && options.dataViews[0] && options.dataViews[0].table ) {
                let tbl = options.dataViews[0].table;
                var newRow = [];
                this.arrValues = [];
                // headers
                if ( this.settings.dataPoint.includeHeader ) {
                    for(var i=0; i<tbl.columns.length; i++) {
                        newRow.push(tbl.columns[i].displayName);
                    }
                    this.arrValues.push(newRow);
                }
                // data
                for(var r=0; r<tbl.rows.length; r++) {
                    newRow = [];
                    for( var c=0; c<tbl.columns.length; c++) {
                        newRow.push(tbl.rows[r][c]);
                    }
                    this.arrValues.push(newRow);
                }
                noRows = tbl.rows.length;
            }

            var thisRef = this;
            this.copyButton.innerText = "Export "+(noRows-1)+" rows to clipboard";
            this.copyButton.onclick = function(e) {
                thisRef.clickCopy(e, thisRef);
            }

            
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}