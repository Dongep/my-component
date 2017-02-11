<template>
    <div class="select-group">
        <div v-bind:class="{'select-stand':true,'select-stand-readonly': readonly}">
            <div class="btn-select dropdown-toggle" data-toggle="dropdown" v-on:click="toggle">
                <input type="text" class="select-value" data-val="{{chosePre.fval}}" name="{{autoChose}}" id="{{id}}" v-model="chosePre.fcn" readonly >
                <span class="caret"></span>
            </div>
            <template v-if="type!='pop'">
                <div class="dropdown-menu scroll-stand" style="display:none">
                    <template v-if="type=='single'">
                        <ul>
                            <li data-val="" >
                                <label v-on:click="chose($event)">...</label>
                            </li>
                            <li v-for="item in list"  data-val={{item[customField.val]}} >
                                <label v-on:click="chose($event)">{{item[customField.cn]}}</label>
                            </li>
                        </ul>
                    </template>
                    <template v-if="type=='multi'">
                        <ul class="multi-input">
                            <li v-for="item in list" v-on:click="chose($event)" data-val="{{item[customField.val]}}" >
                                <input type="checkbox" id="ulti{{$index}}"/><label for="multi{{$index}}">{{item[customField.cn]}}</label>
                            </li>
                        </ul>
                    </template>
                </div>
                </template>
        </div>
    </div>
</template>

<script>
module.exports = {
    props: ['infoType', 'type','id', 'readonly', 'localdata', 'auth', 'url', 'autoChose', 'afterChose', 'beforeChose', 'spreadEvent','customField','paras','linkage','auto','linkField'],
    data: function () {
        return {
            list: '', //选项fcodeKey,fcodeValue_cn或者自定义
            chosePre: {
                fval: '',
                fcn: ''
            }, //当前选中
            willChose: '',//要选择的值，避免还未返回数据时要选中值的情况
            islistReady: false,
            multi: [] //存储分隔好的多选数据
            // statu: false //状态，是否显示
            //fcode:color请求所带参数
            //autoChose 自动选择的对应form字段的key
            //customField 自定义值和文字字段customField{val:asd,cn:asd}
            //spreadEvent展开事件
            //paras自定义参数
        }
    },
    ready: function () {
        var self = this;
        if(!this.type)
        {
            this.type = 'single';
        }
        if (!this.customField) {
            this.customField = {
                val: 'fcodeKey',
                cn: 'fcodeValue_cn'
            }
        }
        if (!this.localdata) {
            if (this.infoType) {
                if (!self.auth) {
                    self.auth = false
                }
                //默认请求地址
                if (!this.url) {
                    this.url = '/dictItem/list.json';
                }
                $.ajax({
                    url: self.url,
                    type: "GET",
                    dataType: "json",
                    data: {
                        "fcode": self.infoType,
                        "auth": self.auth
                    },
                    success: function (data) {
                        self.list = data;
                        self.islistReady = true;
                        if (self.willChose) {
                            self.choseSome(self.willChose);
                            self.willChose = '';
                        }
                    }
                })
            }
            else if(this.url&&!this.linkField) {
                //默认请求地址
                
                self.req();
                // $.ajax({
                //     url: self.url,
                //     type: "GET",
                //     dataType: "json",
                //     data: self.paras,
                //     success: function (data) {
                //         self.list = data;
                //         self.islistReady = true;
                //         if (self.willChose) {
                //             self.choseSome(self.willChose);
                //             self.willChose = '';
                //         }
                //     }
                // })
            }
        }
        else {
            this.list = this.localdata;
        }
    },
    methods: {
        //重置select
        clear: function () { 
            this.list = [];
            this.chosePre = {
                fval: '',
                fcn: ''
            }
        },
        setData: function (data) {
            this.list = data;
            this.islistReady = true;
            if (self.willChose) {
                self.choseSome(self.willChose);
                self.willChose = '';
            }
        },
        req: function (paras,auto) { 
            this.islistReady = false;
            var self = this;
            $.ajax({
                    url: self.url,
                    type: "GET",
                    dataType: "json",
                    data: paras,
                    success: function (data) {
                        self.list = data;
                        self.islistReady = true;
                        if (self.willChose) {
                            self.choseSome(self.willChose,auto);
                            self.willChose = '';
                        }
                        else{
                            
                        }
                    }
                })
        },
        searchData: function (targetData) {
            var val = this.customField.val, cn = this.customField.cn, fcn = [];
            if (typeof targetData == 'string' || typeof targetData == 'number') {
                for (var key in this.list) {
                    if (this.list[key][val] == targetData) {
                        return this.list[key][cn]
                    }
                }
            }
            else if (typeof targetData == 'object') {
                for (var key in this.list) {
                    for (var m = 0; m < this.multi.length; m++) {
                        if (this.list[key][val] == this.multi[m]) {
                            fcn.push(this.list[key][cn]);
                        }
                    }

                }
                return fcn
            }

        },
        //点击
        chose: function (e) {
            var et = e.target, i = 0;
            while (et.tagName != "LI" && i < 10) {
                et = et.parentNode;
                i++;
            }
            if (this.type == 'multi') {
                // e.stopPropagation();
                if (e.target.tagName == "LABEL") return
                var allInput = et.parentNode.getElementsByTagName('INPUT');
                this.multi = [];
                for (var i = 0; i < allInput.length; i++) {
                    if (allInput[i].checked) {
                        this.multi.push(allInput[i].parentNode.getAttribute('data-val'))
                    }
                }
                this.choseSome(this.multi.join(','));
            }
            else if (this.type == 'single') {
                var wantChose = et.getAttribute('data-val');
                var wantChoseData = {
                        fval: wantChose,
                        fcn: this.searchData(wantChose)
                };
                if (this.beforeChose) {
                    this.beforeChose(wantChoseData) && this.choseSome(wantChose);
                }
                else {
                    this.choseSome(wantChose);
                }
                this.toggle();

            }

        },
        //选中
        choseSome: function (codekey,auto) { //auto是否是自动选中
            //如果数据还未就绪，缓存要选择的值
            // console.log(codekey,auto)
            if (!this.islistReady&&codekey !== '' && codekey !== null && codekey !== undefined) {
                this.willChose = codekey;
                // console.log(this.willChose)
                return
            }
            if (codekey !== '' && codekey !== null && codekey !== undefined) {
                if (this.type == 'single') {
                    var targetData;
                    this.chosePre.fval = codekey;
                    this.chosePre.fcn = this.searchData(codekey);
                    !auto&&this.afterChose && this.afterChose(this.chosePre);
                }
                else if (this.type == 'multi') {
                    this.chosePre.fval = codekey;
                    this.multi = codekey.split(',');
                    this.chosePre.fcn = this.searchData(this.multi).join(',');
                    !auto&&this.afterChose && this.afterChose(this.chosePre);
                }

            }
            else {
                this.chosePre.fval = '';
                this.chosePre.fcn = '';
                if (this.type == 'multi') {
                    var allInput = this.$el.querySelector('.multi-input').querySelectorAll('input');
                    for(var i=0;i<allInput.length;i++)
                    {
                        allInput[i].checked = false;
                    }
                }
            }
        },
        //返回选中值
        val: function () {
            return this.chosePre.fval
        },
        //切换
        toggle: function () {
            var allSelect = document.querySelectorAll('.select-group');
            var thisSelect = this.$el;
            for(var i = 0 ; i < allSelect.length; i++)
            {
                if(allSelect[i]!=thisSelect)
                {
                    allSelect[i].querySelector('.dropdown-menu').style.display='none';
                }
            }
            thisSelect = thisSelect.querySelector('.dropdown-menu');
            if(!this.readonly)
            {
                if(thisSelect.style.display =='block')
                {
                    thisSelect.style.display ='none';
                }
                else{
                    thisSelect.style.display ='block';
                    this.spreadEvent&&spreadEvent();
                }
            }
            
        }
    },
    events: {
        'formDataReady': function (msg) {
            if(this.linkField)
            {
                var form={} ;
                for(var i in this.linkField)
                {
                    form[i] = msg[this.linkField[i]];
                }
                this.req(form,true);
            }
            this.autoChose && this.choseSome(msg[this.autoChose],true);
        },
        'formAdd': function () {
            this.choseSome();
            if(this.linkField){
                this.clear();
            }
        },
        //清除选中
        'clear': function () {
            this.choseSome();
        }
    }
}
</script>
<style>
    
</style>
