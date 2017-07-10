'use strict';

var result_catch = "";
var isWorking = false;
var inputTimer = null;
var autoRecognise = true;
var languageList = ['中文', '英文', '日文', '韩文'];
var languageIDs = ['zh','en','jp', 'kr'];

var currentSourceLanguage = -1;
var currentRealSourceLanguage = 0;
var currentTargetLanguage = 1;

var wordLimit = 0;

function getLanguageId(text) {
    for (var i = 0, length = languageList.length; i < length; i++) {
        if (text.indexOf(languageList[i]) >= 0) {
            return i;
        }
    }
    return -1;
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
}

function updateTargetLanguageButton(languageId, isResult) {
    if (!isResult) {
        currentTargetLanguage = languageId;
    }

    if (languageId >= 0 && languageId < languageList.length) {
        $('#target_language_button').html(languageList[languageId] + '<i class="down_arrow"></i>');
    }
}

function updateSourceLanguageButton(languageId, isResult) {
    var text = "";
    if (isResult) {
        if (languageId >= 0 && languageId < languageList.length) {
            text = '检测到' + languageList[languageId];
        }
    } else {
        currentSourceLanguage = languageId;

        if (languageId >= 0 && languageId < languageList.length) {
            text = languageList[languageId];
            autoRecognise = false;
        } else {
            text = "自动识别";
            autoRecognise = true;
        }
    }
    $('#source_language_button').html(text + '<i class="down_arrow"></i>');
}

function updateTargetLanguageSelectList(sourceLanguageId, targetLanguageId) {
    var html = "";
    if (sourceLanguageId == 0 || sourceLanguageId == -1) {
        html += '<li>' + languageList[targetLanguageId] + '</li>';
        for (var i = 1, length = languageList.length; i < length; i++) {
            if (i == targetLanguageId || i == 2) continue;
            html += '<li>' + languageList[i] + '</li>';
        }
    } else {
        html = '<li>中文</li>'
    }
    $('#target_language').html(html);
    $('#target_language li').unbind();
    $('#target_language li').click(onClickTargetLanguageList);
}

function onClickSourceLanguageList(event) {
    $('#source_language').hide();
    var languageText = $(event.target).text();
    currentSourceLanguage = getLanguageId(languageText);
    if (currentSourceLanguage == 0 && currentTargetLanguage == 0) {
        currentTargetLanguage = 1;
    } else if (currentSourceLanguage == 1 || currentSourceLanguage == 2 || currentSourceLanguage == 3) {
        currentTargetLanguage = 0;
    }
    updateSourceLanguageButton(currentSourceLanguage, false);
    updateTargetLanguageButton(currentTargetLanguage, false);
    updateTargetLanguageSelectList(currentSourceLanguage, currentTargetLanguage);
    updateTranlate();
}

function onClickTargetLanguageList(event) {
    $('#target_language').hide();
    var languageText = $(event.target).text();
    currentTargetLanguage = getLanguageId(languageText);
    updateTargetLanguageButton(currentTargetLanguage, false);
    updateTranlate();
}

function updatePairDisplay() {
    var checked = document.getElementById("pair_display").checked;
    if (checked) {
        $('.text-src').removeClass('hidden');
    } else {
        $('.text-src').addClass('hidden');
    }
    updateHeight();
}

function updateHeight() {
    var inputHeight = $('#input-text-bg').height();
    var inputHeight2 = $('#input-text-bg2').height();
    var outputHeight = $('#text-output').height();
    if(wordLimit > 0) {
      outputHeight += 55;
    }

    var maxHeight = inputHeight;
    if (inputHeight2 > maxHeight) {
      maxHeight = inputHeight2
    }

    if (outputHeight > maxHeight) {
      maxHeight = outputHeight
    }

    $('#input-box').height(maxHeight + 80);
}

function updateHighLight() {
    $('.text-dst').mouseover(function() {
        var sce = $('.' + $(this).attr('class').substring(9));
        sce.addClass('highlight');
        console.log(sce);
    });

    $('.text-dst').mouseout(function() {
        $('.highlight').removeClass('highlight');
    });
}

function showTips(text) {
    $('#input-box').tooltip('show', {
        autohide: true,
        autoshow: true,
        content: text,
        countdown: false,
        dismissible: false,
        duration: 2000,
        fixed: true,
        offset: 10,
        position: 'center middle',
        style: 'default',
        zIndex: 999999
    });
}

function exchangeLanguageID(id) {

    if(id < 4 && id >= 0)
    {
        return languageIDs[id];
    }

    return 'auto';
}

function exchangeLanguageString(id) {
    for(var i=0; i<languageIDs.length; i++)
    {
        if(id == languageIDs[i])
        {
            return i;
        }
    }

    return -1;
}

function translateText(source_text, from_language_id, target_language_id) {
    isWorking = true;
    $.ajax({
        url: "/test/",
        type: "post",
        dataType: "json",
        data: {
            source: exchangeLanguageID(from_language_id),
            target: exchangeLanguageID(target_language_id),
            sourceText: source_text,
        },
        success: function(response) {
            isWorking = false;

            var value = $('#text-input').val();
            if (!value || value.length == 0) {
                return;
            }
            var html = '';
            var sourceHtml = '';
            var description_text = '';
            
            var sentenceId = 0;

            if(response.options && response.options.limit && response.options.limit > 0)
            {
              wordLimit = response.options.limit;
              $('#text-output-limit').show();
              $('#text-output-limit').empty().text('翻译君字数限制为' + wordLimit +',之后文本没有翻译');
              $('#text-output').css('top', '55px');
            }
            else
            {
              $('#text-output-limit').hide();
              $('#text-output').css('top', '15px');
            }

            currentRealSourceLanguage = exchangeLanguageString(response.source);
            if (autoRecognise) {
                updateSourceLanguageButton(exchangeLanguageString(response.source), true);
                updateTargetLanguageButton(exchangeLanguageString(response.target), true);
                updateTargetLanguageSelectList(currentSourceLanguage, currentTargetLanguage);
            }

            var isFirst = true;
            for(var i=0, ilength= response.records.length; i < ilength; i++)
            {
                var sentence = response.records[i];

                if(sentence.sourceText == '\n')
                {
                    html += '<br/>';
                    sourceHtml += '<br/>';
                }
                else
                {
                    html += '<span class="text-src">';
                if (!isFirst) {
                    html += '<br />';
                }
                html += sentence.sourceText + '<br/></span><span class="text-dst sentence-' + sentenceId + '">' + sentence.targetText + '</span>';
                sourceHtml += '<span class="sentence-' + sentenceId + '">' + sentence.sourceText.replace(/ /g, '&nbsp;') + '</span>';

                sentenceId++;
                description_text += sentence.targetText;
                description_text += "\r\n";
                isFirst = false;
                }
            }

            $('#text-output').html(html);
            $('#input-text-bg').html(sourceHtml);
            $('#copy_button').attr('data-clipboard-text', description_text);

            result_catch = description_text;

            updatePairDisplay();
            updateHeight();
            updateHighLight();

        },
        error: function(xhr) {
            isWorking = false;
            alert("翻译错误！");
        }
    });
}

function playText(text, language) {
    $('audio').remove();

    var guid = $.cookie("fy_guid");
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'http://audiodetect.browser.qq.com:8080/tts?platform=PC_Website&language='+language+'&text=' + text + '&guid=' + guid);
    audioElement.setAttribute('autoplay', 'autoplay');
    $(document.body).append(audioElement);
    pgvSendClick({
        hottag: 'MIG.CLICK.BUTTON.PLAY'
    });
}

function updateTranlate() {
    var value = $('#text-input').val()

    if (value && value.length > 0) {
        if (!isWorking) {
            translateText(value, currentSourceLanguage, currentTargetLanguage);
        }
        value = value.replace(/</g, '&lt;');
        value = value.replace(/>/g, '&gt;');
        value = value.replace(/ /g, '&nbsp;');
        value = value.replace(/\n/g, '<br/>');

        var bg = $('#input-text-bg');
        var bg2 = $('#input-text-bg2');
        bg.html(value);
        bg2.html(value);
        updateHeight();
    } else {
        $('#text-output').html("");
        $('#copy_button').attr('data-clipboard-text', "");
    }
}

var base_url = 'http://report.translator.qq.com';

function report() {

    var guid = $.cookie("fy_guid");

    var url = base_url + '/report?' + [
        {k : 'guid', v : guid},
        {k : 'osType', v : 'PC_Website'},
        {k : 'iProtocol', v : 1001},
    ].map(function(item) {
        return item.k + '=' + item.v;
    }).join('&');
    console.log(url);
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
}

jQuery(document).ready(function($) {

    $('#source_language_button').click(function() {
        $('#source_language').show();

        pgvSendClick({
            hottag: 'MIG.CLICK.BUTTON.SOURCE_LANGUAGE'
        });
    });

    $('#target_language_button').click(function() {
        if (currentSourceLanguage == 0 || currentSourceLanguage == -1) {
            $('#target_language').show();
        }
        pgvSendClick({
            hottag: 'MIG.CLICK.BUTTON.TARGET_LANGUAGE'
        });
    });

    $('#source_language li').unbind();
    $('#source_language li').click(onClickSourceLanguageList);

    $('#target_language li').unbind();
    $('#target_language li').click(onClickTargetLanguageList);

    $('.download').click(function() {
        $('.download-mask').removeClass('hidden');
        $('.download-box').removeClass('hidden');

        pgvSendClick({
            hottag: 'MIG.CLICK.BUTTON.DOWNLOAD'
        });
    });



    $('.download-mask').click(function(event) {
        $('.download-mask').addClass('hidden');
        $('.download-box').addClass('hidden');
    })

    $('#close-button').click(function(event) {
        $('.download-mask').addClass('hidden');
        $('.download-box').addClass('hidden');
    });

    $('.download-box').click(function(evetn) {
        event.stopPropagation();
    })

    $('#exchange_button').click(function() {
        if (!autoRecognise) {
            var tmp = currentSourceLanguage;
            currentSourceLanguage = currentTargetLanguage;
            currentTargetLanguage = tmp;
            updateTargetLanguageButton(currentTargetLanguage, false);
            updateSourceLanguageButton(currentSourceLanguage, false);
            updateTranlate();
        }

    })

    $('#pair_display').change(function() {
        updatePairDisplay();
        var checked = document.getElementById("pair_display").checked;
        if (checked) {
            pgvSendClick({
                hottag: 'MIG.SWITCH.PAIRDISPLAY.TRUE'
            });
        } else {
            pgvSendClick({
                hottag: 'MIG.SWITCH.PAIRDISPLAY.FALSE'
            });
        }
    });

    $('#clean_button').click(function() {
        $('#text-input').val("");
        $('#text-output').html("");
        $('#input-text-bg').html("");
        updateHeight();
    });

    $('#bottom_qrcode_button').click(function() {
        $('#bottom_qrcode_button').hide();
        $('#bottom_qrcode').show();
    });



    $('#text-input').on('propertychange input', function() {

        if(inputTimer)
        {
            clearTimeout(inputTimer);
        }

        inputTimer = setTimeout(function(){ updateTranlate(); }, 500);
    });

    $("#translate_button").click(function() {

        pgvSendClick({
            hottag: 'MIG.CLICK.BUTTON.TRANSLATE'
        });
        var source_text = $('#text-input')[0].value;
        var from_language_id = currentSourceLanguage;
        var target_language_id = currentTargetLanguage;

        if (from_language_id == -1) {
            pgvSendClick({
                hottag: 'MIG.TRANSLATE.SOURCE.AUTO'
            });
        } else if (from_language_id == 0) {
            pgvSendClick({
                hottag: 'MIG.TRANSLATE.SOURCE.CHINESE'
            });
        } else if (from_language_id == 1) {
            pgvSendClick({
                hottag: 'MIG.TRANSLATE.SOURCE.ENGLISH'
            });
        } else if (from_language_id == 2) {
            pgvSendClick({
                hottag: 'MIG.TRANSLATE.SOURCE.JAPANESE'
            });
        } else if (from_language_id == 3) {
            pgvSendClick({
                hottag: 'MIG.TRANSLATE.SOURCE.KOREAN'
            });
        }

        if (target_language_id == 0) {
            pgvSendClick({
                hottag: 'MIG.TRANSLATE.TARGET.CHINESE'
            });
        } else if (target_language_id == 1) {
            pgvSendClick({
                hottag: 'MIG.TRANSLATE.TARGET.ENGLISH'
            });
        } else if (target_language_id == 2) {
            pgvSendClick({
                hottag: 'MIG.TRANSLATE.TARGET.JAPANESE'
            });
        } else if (target_language_id == 3) {
            pgvSendClick({
                hottag: 'MIG.TRANSLATE.TARGET.KOREAN'
            });
        }

        if (source_text && source_text.length > 0) {
            translateText(source_text, from_language_id, target_language_id);
        }
    });

    $('#play_input_text').click(function() {
        var source_text = $('#text-input')[0].value;
        playText(source_text, currentRealSourceLanguage);
    });
    $('#play_output_text').click(function() {
        if (result_catch) {
            playText(result_catch, currentTargetLanguage);
        }
    });

    $('.play_text').tips({
        msg: '发音'
    });

    $('#copy_button').tips({
        msg: '复制'
    });

    var pre_translate_text = getQueryString('text');
    if(pre_translate_text && pre_translate_text.length > 0)
    {
      pre_translate_text = pre_translate_text.replace(/\*\(br\)\*/g,'\n');
      $('#text-input').val(pre_translate_text);
      updateTranlate();
    }

    var hash = location.hash;
    if (hash.indexOf('#download') >= 0) {
        $('.download-mask').removeClass('hidden');
        $('.download-box').removeClass('hidden');
    }

    window.onclick = function(event) {
        var ev = event || window.event;
        var target = ev.target || ev.srcElement;

        if (!target.matches('#target_language_button') && !target.matches('#source_language_button') && !target.matches('.down_arrow')) {
            $('#target_language').hide();
            $('#source_language').hide();
        }

        // if (!target.matches('#bottom_qrcode_button')) {
        //     $('#bottom_qrcode_button').show();
        //     $('#bottom_qrcode').hide();
        // }
    }

});
