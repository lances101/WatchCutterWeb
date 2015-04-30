/// <reference path="jquery.min.js" />
function Question() {
    this.start = 0;
    this.questionEnd = 0;
    this.end = 0;
    this.questionText = "";
    this.answerText = "";
};
function SaveableImage() {
    this.dataURL = "";
    this.name = "";

}

function updateResultSize() {
    $("#resultArea").width($("#resultWidth").val());
    $("#resultArea").height($("#resultHeight").val());
};

questionsFound = [];
var regexQuestionPattern = /^(\d{1,3})[.].+/gm;
function highlightQuestions() {
    var currentQuestionNumber = 1;
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
                var question = new Question();
                question.start = res.index;
                question.questionText = res[0];
                question.questionEnd = regexQuestionPattern.lastIndex;
                $("#listFoundQuestions").append("<option>" + res[0] + "</option>");
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
    fillResultArea();
}

function fillResultArea() {
    for (var i = 0; i < questionsFound.length; i++) {
        if (i == 0) {
           
        }
    }
}
function selectionChanged(index) {
    var buffer = $("#drawerCanvas");
    $("#resultScreen").empty();
    $("#resultScreen").append(buffer);
    generateImages(questionsFound[index].answerText);
}
function generateImages(text) {
    var localImages = [];
    var canvas = $("#drawerCanvas")[0];
    canvas.width = 200;
    canvas.height = 200;
    var context = canvas.getContext('2d');
    context.font = '9pt Arial';
    
    var words = text.split(" ");
    
    var left = fillCanvasWithText(context, words, 20, 20,
                200, 200, 16);
    var img = canvas.toDataURL("image/png");
    localImages.push(img);
    $("#resultScreen").append('<a href="' + img + '"><img src="' + img + '"/></a>');
    while (left != null) {
        context.clearRect(0, 0, 200, 200);
        left = fillCanvasWithText(context, left, 20, 20, 200, 200, 16);
        img = canvas.toDataURL("image/png");
        $("#resultScreen").append('<a href="' + img + '"><img src="' + img + '"/></a>');
        localImages.push(img);
    }
}


function fillCanvasWithText(context, words, marginLeft, marginTop, maxWidth, maxHeight, lineHeight) {
    var countWords = words.length;
    var line = "";
    for (var n = 0; n < countWords; n++) {
        var testLine = line + words[n] + " ";
        var testWidth = context.measureText(testLine).width;

        if (marginTop + lineHeight > maxHeight) {
            return words.slice(n, words.length);
        }
        if (testWidth + marginLeft > maxWidth) {
            context.fillText(line, marginLeft, marginTop);
            line = words[n] + " ";
            marginTop += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, marginLeft, marginTop);
    return null;
}


$(window).load(function () {
    $('.editable').each(function () {
        this.contentEditable = true;
    });
    updateResultSize();
});