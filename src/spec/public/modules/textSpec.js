import {textConverter} from "../../../public/modules/text.js";

describe("textConverter tests", function() {
    it("textConverter is not null", function() {
        expect(textConverter).not.toBe(null);
    });

    it("textConverter is a function", function() {
        expect(textConverter).toEqual(jasmine.any(Function));
    });

    it("parseChar return a div markup", function() {
        var result = textConverter().parseChar("j", textConverter().fontColor.whiteOnBlue, "text");
        expect(result).toBe('<div class="char" data-char="j" style="background-position: -160px -0px"></div>');
    });

    it("Check font color values", function() {
        var fontColors = textConverter().fontColor;
        expect(fontColors.whiteOnBlue).toBe(0);
        expect(fontColors.blueOnWhite).toBe(16);
        expect(fontColors.whiteOnOrange).toBe(32);
        expect(fontColors.blackOnBlue).toBe(48);
        expect(fontColors.blackOnWhite).toBe(64);
        expect(fontColors.whiteOnBlack).toBe(80);
        expect(fontColors.blueOnWhiteInactive).toBe(96);
        expect(fontColors.orangeOnBlack).toBe(112);
        expect(fontColors.blackOnOrange).toBe(128);
    });

    it("parseChar return a div markup", function() {
        var result = textConverter().convertText("Amiga 500", textConverter().fontColor.whiteOnBlack);
        expect(result).toBe(
            '<div class="word">' +
            '<div class="char" data-char="A" style="background-position: -408px -80px"></div>' +
            '<div class="char" data-char="m" style="background-position: -184px -80px"></div>' +
            '<div class="char" data-char="i" style="background-position: -152px -80px"></div>' +
            '<div class="char" data-char="g" style="background-position: -136px -80px"></div>' +
            '<div class="char" data-char="a" style="background-position: -88px -80px"></div>' +
            '<div class="char" data-char=" " style="background-position: -0px -80px"></div>' +
            '</div>' +
            '<div class="word">' +
            '<div class="char" data-char="5" style="background-position: -48px -80px"></div>' +
            '<div class="char" data-char="0" style="background-position: -8px -80px"></div>' +
            '<div class="char" data-char="0" style="background-position: -8px -80px"></div>' +
            '</div>' +
            '<div class="stop"></div>'
        );
    });
});