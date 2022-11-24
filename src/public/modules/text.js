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
    var fontColor = {
        whiteOnBlue : 0,
        blueOnWhite : 16,
        whiteOnOrange : 32,
        blackOnBlue : 48,
        blackOnWhite : 64,
        whiteOnBlack : 80,
        blueOnWhiteInactive : 96,
        orangeOnBlack : 112,
        blackOnOrange : 128
    };

    //Convert string text to amiga style font div-element-text
    var convertText = (text, color) =>
    {
        //Replace some tags
        text=text//.replace(/<\/*(br|ul) *\/*>/g,'<div class="stop"></div>')
            .replace(/<br *\/*>/g, '<div class="stop"></div>')
            .replace(/<ul>/g,'<div class="stop"></div><div class="list">')
            .replace(/<\/ul>/g,'<div class="stop"></div></div>')
            .replace(/<li>/g,'- ')
            .replace(/<\/li>/g,'<div class="stop"></div>')
            .replace(/<table>/g, '<div class="stop"></div><table>');
        
    
        var result="";
        var tagMode=false;
        var word='<div class="word">';
        var tableHeadColor=fontColor.blackOnWhite;
        var linkColor=fontColor.whiteOnOrange;
        var curColor=color;
        for(var i=0; i<text.length; i++)
        {
            var character=text.slice(i,i+1);
            //Check whether an html tag begins
            tagMode=tagMode || character=="<";
            if(tagMode)
            {
                if(character=="<")
                    result=result+word+"</div>";
                //Add tag to result without converting it
                result=result+character;
                //Do not convert the text until the tag stops
                tagMode=character!=">";
                if(tagMode)
                    word='<div class="word">';
                continue;
            }
            //Check font color to use
            var tableHead=result.search(/<th *colspan="[0-9]*">/)!=-1
            && result.search(/<\/th>/)==-1;
            var link=result.search(/<a* href=".*">/)!=-1
            && result.search(/<\/a>/)==-1;
            if(tableHead)
                curColor=tableHeadColor;
            else if(link)
                curColor=linkColor;
            else
                curColor=color;
            //Get Amiga font div element equivalent to the passed character
            var element=parseChar(character, curColor, "text");
            //Add the element to the current word
            if(element)
                word=word+element;
            //Add current word to resultset and create a new word in 
            //case of a space character
            if(character==" ")
            {
                result=result+word+"</div>";
                word='<div class="word">';			  
            }		
        }
        result=result+word+'</div><div class="stop"></div>';
    //console.debug(result);		
        return result;
    };

    //Test method for string -> charset image conversion
    var parseChar = (character, color, mode) =>
    {
        var xCoord=getCharIndex(character);
    //console.debug("Char: %s, Mapping: %i", character, xCoord);
        if(typeof xCoord!=="number")
            return null;
        if(typeof color!=="number")
            return null;
        if(mode==="text")
            return '<div class="char" data-char="'+ character +
                '" style="background-position: -'+xCoord+'px -'
                +color+'px"></div>';
    };

    //Charset mapping for topaz font
    var getCharIndex = character =>
    {
        var charsetMapping = [
            " ", "0", "1", "2", "3", "4", "5", "6",	"7", "8", "9",
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
        
        for(var index in charsetMapping)
        {
            if(character===charsetMapping[index])
            return index*8;
        }
        return 0;
    };

    return {
        fontColor : fontColor,
        convertText : convertText,
        parseChar, parseChar
    };
};