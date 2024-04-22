import path from 'path';
import {correct, StageTest, wrong} from 'hs-test-web';

const pagePath = path.join(import.meta.url, '../../src/index.html');

class Test extends StageTest {

    page = this.getPage(pagePath)

    tests = [this.node.execute(async () => {
        // test #1
        // set viewport
        await this.page.open()
        await this.page.setViewport({width: 1024, height: 768})

        return correct()
    }), this.page.execute(() => {
        // test #2
        // HELPERS-->
        // method to check if element with id exists
        this.elementExists = (id, nodeNames) => {
            const element = document.body.querySelector(id);
            if (!element) return true;
            else return (nodeNames && !nodeNames.includes(element.nodeName.toLowerCase()));
        };

        // method to check the style of the element with id
        this.elementStyle = (id, style, value, strict=true) => {
            const element = document.body.querySelector(id);
            if (!element) return true;
            let styleValue = getComputedStyle(element)[style];
            //console.log(styleValue);
            if (styleValue.includes('px')) {
                const numericValue = parseFloat(styleValue);
                styleValue = `${Math.round(numericValue)}px`;
            }
            if (!strict) return !styleValue.includes(value);
            return styleValue !== value;
        };

        // method to check if element with id has right text
        this.elementHasText = (id) => {
            const element = document.body.querySelector(id);
            if (!element) return true;

            return !element.innerText || element.innerText.trim().length === 0;
        };

        // method to compare two elements position
        this.elementPositionCompareX = (id1, id2, directNode=true) => {
            let element1 = id1
            let element2 = id2;
            if (!directNode) {
                element1 = document.body.querySelector(id1);
                element2 = document.body.querySelector(id2);
            }
            if (!element1 || !element2) return true;
            const top1 = element1.getBoundingClientRect()["top"]; // y
            const left1 = element1.getBoundingClientRect()["left"]; // x
            const top2 = element2.getBoundingClientRect()["top"]; // y
            const left2 = element2.getBoundingClientRect()["left"]; // x
            // console.log("x1:", left1, "y1:", top1, "x2:", left2, "y2:", top2);
            let topDiff = Math.abs(top2 - top1) > 15;
            return topDiff || left1 > left2;
        }

        // method to compare two elements position
        this.elementPositionCompareY = (id1, id2, directNode=true) => {
            let element1 = id1
            let element2 = id2;
            if (!directNode) {
                element1 = document.body.querySelector(id1);
                element2 = document.body.querySelector(id2);
            }
            if (!element1 || !element2) return true;
            const top1 = element1.getBoundingClientRect()["top"]; // y
            const left1 = element1.getBoundingClientRect()["left"]; // x
            const top2 = element2.getBoundingClientRect()["top"]; // y
            const left2 = element2.getBoundingClientRect()["left"]; // x
            // console.log("x1:", left1, "y1:", top1, "x2:", left2, "y2:", top2);
            let leftDiff = Math.abs(left2 - left1) > 15;
            return leftDiff || top1 > top2;
        };

        // check border of the element with id
        this.checkBorder = (id, order="bottom", width="1px", style="solid") => {
            if (order === "bottom") {
                if (this.elementStyle(id, this.borderBotStyle, style)) return true;

                if (this.elementStyle(id, this.borderBotWidth, width)) return true;
            } else if (order === "top") {
                if (this.elementStyle(id, this.borderTopStyle, style)) return true;

                if (this.elementStyle(id, this.borderTopWidth, width)) return true;
            }
        };

        // method to check if element with id has right parent element
        this.elementHasParent = (id, parentId) => {
            const parent = document.body.querySelector(parentId);
            if (!parent) return true;
            // console.log(parent.id)
            const element = parent.querySelector(id);
            // console.log(element.id)
            return !element;
        };

        // method to check anchors
        this.checkAnchors = (id, parent) => {
            // check parent
            if (this.elementHasParent(id, parent))
                return this.wrongParentMsg(id, parent);

            // check tag
            if (this.elementExists(id, "a"))
                return this.wrongTagMsg(id, "a");

            // check text
            if (this.elementHasText(id))
                return this.wrongTextMsg(id);

            // check text-decoration
            if (this.elementStyle(id, this.textDec, "none"))
                return this.wrongStyleMsg(id, this.textDec);
        };

        this.checkOrderedAnchors = (element, parent) => {
            // text
            if( !element.innerText || element.innerText.trim().length === 0)
                return this.noTextAnchorMsg(parent);

            // text-decoration
            if(getComputedStyle(element)[this.textDec] !== "none") {
                return this.wrongTextDecorAnchorMsg(parent);
            }
        }

        // CONSTANTS-->
        const checkFigma = "It should be close to the Figma designs.";
        const theElement = "the element with the selector of";
        const thePage = "In the page,";
        this.header = "header";
        this.main = "main";
        this.footer = "footer";
        this.nav = "nav";
        this.textDec = "text-decoration-line";
        this.borderBotStyle = "border-bottom-style";
        this.borderBotWidth = "border-bottom-width";
        this.borderTopStyle = "border-top-style";
        this.borderTopWidth = "border-top-width";
        // <--CONSTANTS

        // MESSAGES-->
        this.missingIdMsg = (id) => {
            return `${thePage} ${theElement} ${id} is missing in the body of the HTML document.`;
        };
        this.wrongTagMsg = (id, tag, tagAlt) => {
            if (tagAlt) return `${thePage} ${theElement} ${id} should be a/an ${tag} or ${tagAlt} tag.`;
            else return `${thePage} ${theElement} ${id} should be a/an ${tag} tag.`;
        };
        this.wrongStyleMsg = (id, style) => {
            return `${thePage} ${theElement} ${id}'s ${style} is different from the Figma designs or the description.`;
        };
        this.wrongParentMsg = (id, parentId) => {
            return `${thePage} ${theElement} ${id} should be a child of ${theElement} ${parentId}.`;
        };
        this.wrongTextMsg = (id) => {
            return `${thePage} ${theElement} ${id} has no text value.`;
        };
        this.noTextAnchorMsg = (id) => {
            return `${thePage} inside ${theElement} ${id}, one of the anchors don't have a text value.`;
        };
        this.wrongTextDecorAnchorMsg = (id) => {
            return `${thePage} inside ${theElement} ${id}, one of the anchors has the wrong text-decoration.`;
        };
        this.wrongPositionCompareXMsg = (id1, id2) => {
            return `${thePage} ${theElement} ${id1} should be on the left of ${theElement} ${id2}.`;
        };
        this.wrongPositionCompareYMsg = (id1, id2) => {
            return `${thePage} ${theElement} ${id1} should be above ${theElement} ${id2}.`;
        };
        this.wrongAnchorLength = (id, amount) => {
            return `${thePage} ${theElement} ${id} should have ${amount} anchor tags inside.`;
        }
        // <--MESSAGES
        return correct();

    }), this.page.execute(() => {
        // test #3
        // STAGE1 TAGS EXIST

        // check if header exists
        if (this.elementExists(this.header)) return wrong(this.missingIdMsg(this.header));

        // check if main exists
        if (this.elementExists(this.main)) return wrong(this.missingIdMsg(this.main));

        // check if footer exists
        if (this.elementExists(this.footer)) return wrong(this.missingIdMsg(this.footer));

        return correct();
    }),
        // test #4 removed
        this.page.execute(() => {
            // test #5
            // STAGE1 CSS PROPERTIES

            // check if header has correct border-bottom
            if (this.checkBorder(this.header))
                return wrong(this.wrongStyleMsg(this.header, "border-bottom"));

            // check if footer has correct border-top
            if (this.checkBorder(this.footer, "top"))
                return wrong(this.wrongStyleMsg(this.footer, "border-top"));

            return correct()
        }),
        this.page.execute(() => {
            // test #6
            // STAGE1 CHILDREN

            // header children

            // check if header has nav
            if (this.elementHasParent(this.nav, this.header))
                return wrong(this.wrongParentMsg(this.nav, this.header));

            // check #nav-brand
            if (this.checkAnchors("#nav-brand", this.header))
                return wrong(this.checkAnchors("#nav-brand", this.header));

            let anchors = Array.from(document.querySelectorAll(this.nav + " a"));
            let anchorNum = 4;
            if (anchors.length !== anchorNum)
                return wrong(this.wrongAnchorLength(this.nav, anchorNum));

            const temp = [];
            anchors.forEach(anchor => {
                const result = this.checkOrderedAnchors(anchor, this.nav);
                if (result)
                    temp.push(result);
            });
            if (temp.length > 0)
                return wrong(temp[0]);

            // footer children
            anchors = Array.from(document.querySelectorAll(this.footer + " a"));
            anchorNum = 5;
            if (anchors.length !== anchorNum)
                return wrong(this.wrongAnchorLength(this.footer, anchorNum));

            anchors.forEach(anchor => {
                const result = this.checkOrderedAnchors(anchor, this.footer);
                if (result)
                    temp.push(result);
            });
            if (temp.length > 0)
                return wrong(temp[0]);

            return correct()
        }),
        this.page.execute(() => {
            // test #7
            // STAGE1 CHILDREN POSITION

            // check nav anchors position
            let anchors = Array.from(document.querySelectorAll(this.nav + " a"));
            let selector = (n) => this.nav + ` a:nth-child(${n})`;
            let temp = [];
            for (let i = 0; i < anchors.length -1; i++) {
                if ( this.elementPositionCompareX(anchors[i], anchors[i + 1]))
                    temp.push(this.wrongPositionCompareXMsg(selector(i + 1), selector(i + 2)));
            }
            if (temp.length > 0) return wrong(temp[0]);

            // check footer anchors position
            anchors = Array.from(document.querySelectorAll(this.footer + " a"));
            selector = (n) => this.footer + ` a:nth-child(${n})`;
            for (let i = 0; i < anchors.length -1; i++) {
                if ( this.elementPositionCompareX(anchors[i], anchors[i + 1]))
                    temp.push(this.wrongPositionCompareXMsg(selector(i + 1), selector(i + 2)));
            }
            if (temp.length > 0) return wrong(temp[0]);

            return correct()
        }),
    ]

}

it("Test stage", async () => {
    await new Test().runTests()
}).timeout(30000);