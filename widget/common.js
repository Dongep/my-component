//缓存当前url
if (!document.getElementById('iframe-ct')) {
    sessionStorage.ifUrl = location.href;
}
//设置日期组件的语言
$.datetimepicker.setLocale('ch');
//表单替换非法字符
function htmlEncode(value){
    return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}


//监听键盘
var common = {};
//已弃用
common.ajax = function (url, reqType, dataType, paramData, async, beforeFuncion, callback) {
    $.ajax({
        url: url,
        type: reqType,
        dataType: dataType,
        data: paramData,
        async: async,
        beforeSend: beforeFuncion,
        success: callback,
        error: function (data) {
            warnFull(jQuery.parseJSON(data.responseText).message);
        }
    });
};
//  common.ajax(self.urlReq,'GET','JSON',{"fcode":self.infoType},true,null,function(data){self.option = data;})
(function ($) {
    //备份jquery的ajax方法
    var _ajax = $.ajax;

    //重写jquery的ajax方法
    $.ajax = function (opt) {
        //备份opt中error和success方法
        var fn = {
            error:function(XMLHttpRequest, textStatus, errorThrown){},
        }
        if(opt.error){
            fn.error=opt.error;
        }

        //扩展增强处理
        var _opt = $.extend(opt, {
            error: function (data,XMLHttpRequest, textStatus, errorThrown) { 
                //错误方法增强处理
                warnFull(jQuery.parseJSON(data.responseText).message,'red');
                fn.error(XMLHttpRequest, textStatus, errorThrown); 
            }
        });
        _ajax(_opt);
    };
})(jQuery);
//组件
//全屏警告
function warnFullFun() {
    var temCon = document.createElement("div");
    temCon.id = 'opera-warn';
    temCon.className = "opera-warn";
    temCon.style.display = 'none';
    temCon.innerHTML = "<div class='warn-box'><p class='warn-text'></p><p class='warn-btncon'><a href='javascript:;' class='warn-cancel'>否</a><a href='javascript:;' class='warn-confirm'>是</a></p></div>";
    document.body.appendChild(temCon);
    var warnYes, warnNo;
    var $opera = document.getElementById('opera-warn');
    var $operaText = $opera.getElementsByClassName('warn-text')[0];
    var $operaBox = $opera.getElementsByClassName('warn-box')[0];
    var $operaYes = $opera.getElementsByClassName('warn-confirm')[0];
    var $operaNo = $opera.getElementsByClassName('warn-cancel')[0];
    var warn = function (text, color, callback1, callback2) {
        var rmet = function () {
            $opera.style.display = 'none';
            $operaYes.removeEventListener('click', warnYes, false);
            $operaNo.removeEventListener('click', warnNo, false);
        }
        rmet();
        $operaBox.className = (color == 'blue' || !color) && 'warn-box' || color == 'yellow' && 'warn-box warn-box-yellow' || color == 'green' && 'warn-box warn-box-green' || color == 'red' && 'warn-box warn-box-red';
        $operaText.innerHTML = text;
        $operaNo.style.display = "inline-block";
        if (typeof callback2 != "function") {
            $operaNo.style.display = 'none';
        }
        $opera.style.display = 'block';
        var warnYes = function (e) {
            callback1 && callback1();
            rmet();
        };
        var warnNo = function (e) {
            callback2 && callback2();
            rmet();
        }
        $operaYes.addEventListener('click', warnYes, false);
        $operaNo.addEventListener('click', warnNo, false);
        
    };
    return warn
};
//顶部警告
function warnTopFun() {
    var temCon = document.createElement('div');
    temCon.id = "opera-warn-top";
    temCon.className = "opera-warn-top";
    temCon.style.display = 'none';
    temCon.innerHTML = "<p class='warn-top'><span class='warn-text'></span><a href='javascript:;' class='warn-confirm'>确认</a><a href='javascript:;' class='warn-cancel'>取消</a></p>";
    document.body.appendChild(temCon);
    var warnYes, warnNo;
    var $opera = document.getElementById('opera-warn-top');
    var $operaTop = $opera.getElementsByClassName('warn-top')[0];
    var $operaText = $opera.getElementsByClassName('warn-text')[0];
    var $operaYes = $opera.getElementsByClassName('warn-confirm')[0];
    var $operaNo = $opera.getElementsByClassName('warn-cancel')[0];
    var warn = function (text, color, callback1, callback2) {
        var time;
        
        $operaYes.removeEventListener('click', warnYes, false);
        $operaNo.removeEventListener('click', warnNo, false);
        $operaTop.className = (color == 'blue' || !color) && 'warn-top' || color == 'yellow' && 'warn-top warn-top-yellow' || color == 'green' && 'warn-top warn-top-green' || color == 'red' && 'warn-top warn-top-red';
        $operaText.innerHTML = text;
        $operaNo.style.display = 'inline-block';
        if (typeof callback2 != "function") {
            $operaNo.style.display = 'none';
        }
        $opera.style.display = 'block';
        var rmet = function () {
            $opera.style.display = 'none';
            $operaYes.removeEventListener('click', warnYes, false);
            $operaNo.removeEventListener('click', warnNo, false);
        }
        var warnYes = function (e) {
            callback1 && callback1();
            clearTimeout(time)
            rmet();
        };
        var warnNo = function (e) {
            callback2 && callback2();
            rmet();
        }
        if(!callback2)
        {
            time = setTimeout(function(){
                $opera.style.display = 'none';
            },2000)
        }
        $operaYes.addEventListener('click', warnYes, false);
        $operaNo.addEventListener('click', warnNo, false);
    };
    return warn
};

//全屏警告warnFull('警告内容'，'颜色blue red yellow green'，点击‘是’执行的函数，点击‘否’执行的函数)
//顶部警告warnTop('警告内容'，'颜色blue red yellow green'，点击‘是’执行的函数，点击’否‘执行的函数)
var warnFull = warnFullFun(), warnTop = warnTopFun();

//按钮锁定
(function () {
    $('body').on('click', '.lock-con .icon-lock', function () {
        $(this).removeClass('icon-lock').addClass('icon-unlock');
        $(this).siblings('.btn').removeClass('btn-disabled').addClass('btn-stand').removeAttr('disabled');
    })
    $('body').on('click', '.lock-con .icon-unlock', function () {
        $(this).removeClass('icon-unlock').addClass('icon-lock');
        $(this).siblings('.btn').removeClass('btn-stand').addClass('btn-disabled').attr('disabled', '');
    })
} ());

//重要事项输入框
(function () {
    $('body').on('focus', '.import-input',function (e){
        var magnifyInput = $(this).parent().find('.magnify-input');
        if (magnifyInput.length===0) {
            var top = $(this).position().top - 30;
            var itit = $("<p class='magnify-input' style='top:" + top + "px'></p>");
            $(this).after(itit);
        }
        magnifyInput.css('display', 'block');
    });
    $('body').on('blur', '.import-input',function (e){
        $(this).parent().find('.magnify-input').css('display', 'none');
    });
    $('body').on('keyup', '.import-input',function (e){
        
            var value = $(this).val();
            var newValue = [];
            var space = $(this).attr('space');
            if(!space)
            {
                space = 4;
            }
            for (var i = 0; i < value.length / space; i++) {
                newValue[i] = value.substring(space * i, space * (i + 1))
            }
            
            $(this).parent().find('.magnify-input').html(newValue.join(' '));

        
    });
    $('body').on('keydown', '.import-input',function (e){
            if ($(this).attr('maxlength')&&$(this).val().length > $(this).attr('maxlength') && e.keyCode >= 48 && e.keyCode <= 57) { return false }
    });
} ());
// ztree滚动
var scrollZtree = function (con, scr) {
    //参数：按钮的容器，滚动的容器
    function exe() {
        //scroll
        var time,//滚动定时
            time2,//scrolling延迟定时
            lengths = 5;//滚动基数
        zt = 1,//开始滚动
            btncon = $('#' + con),//按钮容器
            slt = $('#' + con + ' .slt'),
            slb = $('#' + con + ' .slb'),
            slbtn = $('#' + con + ' .scrollbtn'),
            slcon = $('#' + scr),//滚动的容器
            slmain = slcon.children().eq(0);//滚动的主体
        //向上滚动
        slt.mousedown(function () {
            var sltp;
            time = setInterval(function () {
                sltp = slcon.prop('scrollTop') - lengths;
                if (sltp > 0) {
                    slcon.prop('scrollTop', sltp);
                }
                else {
                    slcon.prop('scrollTop', 0);
                    slt.css('display', 'none');
                }
            }, 20)
        })
        //向下滚动
        slb.mousedown(function () {
            var sltp;
            time = setInterval(function () {
                sltp = slcon.prop('scrollTop') + lengths;
                slcon.prop('scrollTop', sltp);
                if (slcon.prop('scrollTop') == sltp - lengths) {
                    slb.css('display', 'none');
                }
            }, 20)
        })

        //清除定时
        slt.mouseup(function () {
            clearInterval(time);
        })
        slt.mouseout(function () {
            clearInterval(time);
        })
        slb.mouseup(function () {
            clearInterval(time);
        })
        slb.mouseout(function () {
            clearInterval(time);
        })
        //滚动监听
        slcon.scroll(function () {
            zt && slbtn.css('display', 'block');
            clearTimeout(time2)
            time2 = setTimeout(function () {
                over();
            }, 100)
            zt = 0;


        })
        function over() {
            if (slcon.prop('scrollTop') == 0) {
                slt.css('display', 'none');
            }
            else if (slcon.prop('scrollTop') >= slmain.height() - slcon.height()) {
                slb.css('display', 'none');
            }
            zt = 1;
        }
        // 窗口尺寸
        var sizecg = function () {
            if (slmain.height() <= slcon.height()) {
                slbtn.css('display', 'none')
            }
            else {
                if (slcon.prop('scrollTop') == 0) {
                    slb.css('display', 'block')
                }
                else {
                    slbtn.css('display', 'block')
                }

            }
        }
        $(window).resize(function () {
            sizecg();
        })
        btncon.load(function () {
            sizecg();
            slt.css('display', 'none')
        })
        btncon.click(function () {
            setTimeout(function () {
                sizecg();
            }, 400)
        })
    }
    return exe();
}

