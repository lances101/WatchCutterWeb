/// <reference path="jquery.min.js" />
var watchCutterSettings = {
    "questionColor": "yellow",
    "answerColor": "white",
    "backgroundColor": "black",
    "fontFamily": "Calibri",
    "fontSize": "9pt",
    "canvasWidth": "200",
    "canvasHeight": "200"
};
function saveSettings() {
    $.removeCookie("watchCutterSettings");
    $.cookie("watchCutterSettings", JSON.stringify(watchCutterSettings));
    console.log("COOKIE SET BABY");
    console.log($.cookie("watchCutterSettings"));

}
function loadSettings() {
    var cook = $.cookie("watchCutterSettings");
    if (cook) {

        watchCutterSettings = JSON.parse(cook);
        console.log("COOKIE GET BABY");
        console.log($.cookie("watchCutterSettings"));
        $("#resultWidth").val(watchCutterSettings.canvasWidth);
        $("#resultHeight").val(watchCutterSettings.canvasHeight);
        $('#cpQuestionAnswer').colorpicker('setValue', watchCutterSettings.answerColor);
        $('#cpQuestionText').colorpicker('setValue', watchCutterSettings.questionColor);
        $('#cpBackground').colorpicker('setValue', watchCutterSettings.backgroundColor);
    }

}

function QuestionAnswer() {
    this.start = 0;
    this.questionEnd = 0;
    this.end = 0;
    this.questionText = "";
    this.answerText = "";
}

function fontSelectionChanged(val)
{
    watchCutterSettings.fontFamily = val;

    selectionChanged(currentlySelected);
}
function updateResultSize() {
    watchCutterSettings.canvasWidth = $("#resultWidth").val();
    watchCutterSettings.canvasHeight = $("#resultHeight").val();
}
questionsFound = [];
var regexQuestionPattern = /^(\d{1,3})[.].+/gm;
function findQuestions() {
    var currentQuestionNumber = 1;
    questionsFound = [];
    $("#listFoundQuestions").empty();
    var fullText = $("#editorArea").val();
    var lastStartIndex = 0;
    while (true) {
        var res = regexQuestionPattern.exec(fullText);
        if (res != null) {
            var question;
            if (res[1] == currentQuestionNumber) {
                if (question != null) {
                    question.end = res.index - 1;
                    question.answerText = fullText.substring(question.questionEnd, question.end);
                }
                question = new QuestionAnswer();
                question.start = res.index;
                question.questionText = res[0];
                question.questionEnd = regexQuestionPattern.lastIndex;
                lastStartIndex = regexQuestionPattern.index;
                question.end = regexQuestionPattern.index;
                currentQuestionNumber++;
                questionsFound.push(question);
            }
        } else {
            if (lastStartIndex != 0) {
                question.end = fullText.length - 1;
                question.answerText = fullText.substring(question.questionEnd, question.end);
            }
            break;
        }

    }
    shake( $(".alert.alert-success"));
    $(".alert.alert-success").fadeIn(2000);
    $(".alert.alert-success > strong").text("Found " + questionsFound.length + " questions");

    fillQuestionsList();
    $("#cuttedStuffDiv").fadeIn();
    shake($("#btnDL"));
    $("#btnDL").fadeIn(2000);
    shake($("#listFoundQuestions"));
    $("#listFoundQuestions").fadeIn();

}
function fillQuestionsList() {
    for (var i = 0; i < questionsFound.length; i++) {
        $("#listFoundQuestions").append("<a onclick='selectionChanged("
        + i + ")' class='list-group-item questionListElement'>"
        + "<h5 class='list-group-item-heading'>" + ""
        + " Question Length : " + (questionsFound[i].questionEnd - questionsFound[i].start)
        //+ " | Answer Length : " + (questionsFound[i].end - questionsFound[i].questionEnd)
        + "</h5>" + "<p class='list-group-item-text'>" + questionsFound[i].questionText + "</p>"
        + "</a>");
    }
}
var currentlySelected;
function selectionChanged(index) {
    $("#resultScreen").hide();
    if(index == null) return;
    currentlySelected = index;
    $("#listFoundQuestions").children().each(function (cIndex) {
        if (index == cIndex)
            $(this).addClass("active");
        else
            $(this).removeClass("active");
    });
    var buffer = $("#drawerCanvas");
    $("#resultScreen").empty();
    $("#resultScreen").append(buffer);

    var q = generateImages(questionsFound[index].questionText, watchCutterSettings.questionColor, watchCutterSettings.backgroundColor);
    var a = generateImages(questionsFound[index].answerText, watchCutterSettings.answerColor, watchCutterSettings.backgroundColor);
    $("#resultScreen").append('<img src="' + q[0] + '"/>');
    for (var i = 0; i < a.length; i++) {
        $("#resultScreen").append('<img src="' + a[i] + '"/>');
    }
    $("#resultScreen").fadeIn();
}
function packImagesIntoZip() {
    var zip = new JSZip();
    var resultFolder = zip.folder("results");
    var answerLines = "";
    for (var i = 0; i < questionsFound.length; i++) {
        answerLines += questionsFound[i].questionText + "\r\n";
        var genQuestion = generateImages(questionsFound[i].questionText, watchCutterSettings.questionColor, watchCutterSettings.backgroundColor);
        resultFolder.file("00." + getCorrectNumName(i + 1) + "." + getCorrectNumName(0) + ".png", stripBase64ToData(genQuestion[0]), {base64: true});
        var genAnswer = generateImages(questionsFound[i].answerText, watchCutterSettings.answerColor, watchCutterSettings.backgroundColor);
        for (var j = 0; j < genAnswer.length; j++) {
            resultFolder.file("00." + getCorrectNumName(i + 1) + "." + getCorrectNumName(j + 1) + ".png", stripBase64ToData(genAnswer[j]), {base64: true});
        }

    }

    var answersIndex = generateImages(answerLines, watchCutterSettings.questionColor, watchCutterSettings.backgroundColor);
    for (var o = 0; o < answersIndex.length; o++) {
        resultFolder.file("00." + getCorrectNumName(0) + "." + getCorrectNumName(o + 1) + ".png", stripBase64ToData(answersIndex[o]), {base64: true});
    }

    location.href = "data:application/zip;base64," + zip.generate({type: "base64"});
}
function getCorrectNumName(num) {
    var res = "";
    if (num < 100) {
        res += "0";
    }
    if (res < 10) {
        res += "0";
    }
    return res + num.toString();
}
function stripBase64ToData(image) {
    return image.toString().substring(image.indexOf(',') + 1)
}

function generateImages(text, textColor, backColor) {
    var localImages = [];
    var canvas = $("#drawerCanvas")[0];
    canvas.width = watchCutterSettings.canvasWidth;
    canvas.height = watchCutterSettings.canvasHeight;
    var context = canvas.getContext('2d');
    context.fillStyle = backColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = watchCutterSettings.fontSize+'pt ' + watchCutterSettings.fontFamily;
    context.fillStyle = textColor;


    var left = fillCanvasWithText(context, text, 5, 20,
        canvas.width, canvas.height, 16);
    var img = canvas.toDataURL("image/png");
    localImages.push(img);
    while (left != null) {
        context.fillStyle = backColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = textColor;
        left = fillCanvasWithText(context, left, 5, 20, canvas.width, canvas.height, 16);
        img = canvas.toDataURL("image/png");

        localImages.push(img);
    }
    return localImages;
}


function fillCanvasWithText(context, lines, marginLeft, marginTop, maxWidth, maxHeight, lineHeight) {

    if (typeof lines === 'string') {
        lines = lines.split("\n");
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split(" ");
        }
    }
    for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        var words = lines[lineIndex];
        var line = "";
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + " ";
            var testWidth = context.measureText(testLine).width;

            if (marginTop + lineHeight > maxHeight) {
                lines[lineIndex] = words.slice(n, words.length);
                lines = lines.slice(lineIndex, lines.length);
                return lines;
            }
            if ((testWidth + marginLeft > maxWidth)) {
                context.fillText(line, marginLeft, marginTop);
                line = words[n] + " ";
                marginTop += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, marginLeft, marginTop);
        marginTop += lineHeight;
    }

    return null;
}

function shake(div){
    var interval = 100;
    var distance = 10;
    var times = 4;

    $(div).css('position','relative');

    for(var iter=0;iter<(times+1);iter++){
        $(div).animate({
            left:((iter%2==0 ? distance : distance*-1))
        },interval);
    }

    $(div).animate({ left: 0},interval);

}
$(window).load(function () {



    $('.spinWidth .btn:first-of-type').on('click', function() {
        $('.spinWidth input').val( parseInt($('.spinWidth input').val(), 10) + 10);
        watchCutterSettings.canvasWidth = $("#resultWidth").val();

    });
    $('.spinWidth .btn:last-of-type').on('click', function() {
        $('.spinWidth input').val( parseInt($('.spinWidth input').val(), 10) - 10);
        watchCutterSettings.canvasWidth = $("#resultWidth").val();
    });

    $('.spinHeight .btn:first-of-type').on('click', function() {
        $('.spinHeight input').val( parseInt($('.spinHeight input').val(), 10) + 10);
        watchCutterSettings.canvasHeight = $("#resultHeight").val();

    });
    $('.spinHeight .btn:last-of-type').on('click', function() {
        $('.spinHeight input').val( parseInt($('.spinHeight input').val(), 10) - 10);
        watchCutterSettings.canvasHeight = $("#resultHeight").val();
    });

    $('#cpQuestionText').colorpicker().on('changeColor.colorpicker', function(event){
        $(this).css('background-color', event.color.toHex());
        watchCutterSettings.questionColor = event.color.toHex()
        selectionChanged(currentlySelected);
    });
    $('#cpQuestionAnswer').colorpicker().on('changeColor.colorpicker', function(event){
        $(this).css('background-color', event.color.toHex());
        watchCutterSettings.answerColor = event.color.toHex();
        selectionChanged(currentlySelected);
    });
    $('#cpBackground').colorpicker().on('changeColor.colorpicker', function(event){
        $(this).css('background-color', event.color.toHex());
        watchCutterSettings.backgroundColor = event.color.toHex();
        selectionChanged(currentlySelected);
    });

    $('.spinFont .btn:first-of-type').on('click', function() {
        $('.spinFont input').val( parseInt($('.spinFont input').val(), 10) + 1);
        watchCutterSettings.fontSize = $("#spinnerFont").val();

    });
    $('.spinFont .btn:last-of-type').on('click', function() {
        $('.spinFont input').val( parseInt($('.spinFont input').val(), 10) - 1);
        watchCutterSettings.fontSize = $("#spinnerFont").val();
    });
    loadSettings();
    updateResultSize();

});