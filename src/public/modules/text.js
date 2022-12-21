/*
*	Just an Amiga Workbench look and feel clone, written in Javascript.
*	Copyright 2019 by Jan Renken, Hamburg
*	
*	This software is licensed under the GNU General Public License Version 3.0.
*
*	So feel free to use, modify and distribute it.
*
*	Amiga for life...
*/

"use strict";

// Text to image based font parser
export var textConverter = () => {
    //Text, charset and font properties and methods
    let fontColor = {
        whiteOnBlue: 0,
        blueOnWhite: 16,
        whiteOnOrange: 32,
        blackOnBlue: 48,
        blackOnWhite: 64,
        whiteOnBlack: 80,
        blueOnWhiteInactive: 96,
        orangeOnBlack: 112,
        blackOnOrange: 128
    };

    //Convert string text to amiga style font div-element-text
    let convertText = (text, color) => {
        // TODO: Add parser functions for these replacements
        // text = text//.replace(/<\/*(br|ul) *\/*>/g,'<div class="stop"></div>')
        //     .replace(/<br *\/*>/g, '<div class="stop"></div>')
        //     .replace(/<ul>/g, '<div class="stop"></div><div class="list">')
        //     .replace(/<\/ul>/g, '<div class="stop"></div></div>')
        //     .replace(/<li>/g, '- ')
        //     .replace(/<\/li>/g, '<div class="stop"></div>')
        //     .replace(/<table>/g, '<div class="stop"></div><table>');

        let tokens = tokenize(text);

        let result = [];
        parse(tokens, result, color);
       		
        return result.join('');
    };

    //Test method for string -> charset image conversion
    let parseChar = (character, color, mode) => {
        let xCoord = getCharIndex(character);
        //console.debug("Char: %s, Mapping: %i", character, xCoord);
        if (typeof xCoord !== "number")
            return null;
        if (typeof color !== "number")
            return null;
        if (mode === "text")
            return '<div class="char" data-char="' + character +
                '" style="background-position: -' + xCoord + 'px -'
                + color + 'px"></div>';
    };

    //Charset mapping for topaz font
    let getCharIndex = character => {
        const charsetMapping = [
            " ", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
            "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v",
            "w", "x", "y", "z", "\u00e4", "\u00f6", "\u00fc", "\u00df", "\u00e1", "\u00e0", "\u00e2",
            "\u00e9", "\u00e8", "\u00ea", "\u00f3", "\u00f2", "\u00f4", "\u00e6", "A", "B", "C", "D",
            "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
            "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
            "\u00c4", "\u00d6", "\u00dc", "\u00c1", "\u00c0", "\u00c3", "\u00c9", "\u00c8", "\u00ca", "\u00d3", "\u00d2",
            "\u00d4", "\u00c6", "^", "°", "!", "\"", "\u00a7", "$", "%", "&", "/",
            "(", ")", "=", "?", "'", "`", "+", "*", "~", "#", "'",
            "-", "_", ".", ":", ",", ";", "\u00b5", "<", ">", "|", "[",
            "]", "@", "\u00b2", "\u00b3", "\\", "{", "}"
        ];

        for (let index in charsetMapping) {
            if (character === charsetMapping[index])
                return index * 8;
        }
        return 0;
    };

    let tokenize = text => {
        const regex = /((?:<[^>]+>)|(?:\w+))/;
        let tokens = text.split(regex).filter(s => s !== "");
        return tokens;
    }

    let parse = (tokens, result, color) => {
        parseText(tokens, result, color);
        result.push('<div class="stop"></div>');
    };

    let parseText = (tokens, result, color) => {
        while (tokens.length > 0) {
            let token = tokens.shift();

            if (tryParseTag(token, tokens, result))
                continue;

            if (tryParseCloseTag(token, result))
                return;

            parseWord(token, result, color);
        }
    };

    let tryParseTag = (token, tokens, result) => {
        if (parseLink(token, tokens, result))
            return true;

        if (parseTableHeader(token, tokens, result))
            return true;

        return false;
    };

    let parseLink = (token, tokens, result) => {
        if (!token.startsWith('<a'))
            return false;

        result.push(token);

        parseText(tokens, result, fontColor.whiteOnOrange);
        return true;
    };

    let parseTableHeader = (token, tokens, result) => {
        if (!token.startsWith('<th'))
            return false;

        result.push(token);

        parseText(tokens, result, fontColor.blackOnWhite);
        return true;
    };

    let parseWord = (token, result, color) => {
        let word = token.split('')
            .map(c => parseChar(c, color, "text"))
            .join('');

        result.push('<div class="word">' + word + '</div>');
    };

    let tryParseCloseTag = (token, result) => {
        if (!token.startsWith('</'))
            return false;

        result.push(token);
        return true;
    };
    return {
        fontColor: fontColor,
        convertText: convertText,
        parseChar, parseChar
    };
};