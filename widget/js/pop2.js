Vue.component('select-search', {
    template: '<div class="select-group">' +
        '<div v-bind:class="{\'select-stand\':true,\'select-stand-readonly\': readonly}">' +
            '<div class="btn-select dropdown-toggle" data-toggle="dropdown" v-on:click="toggle">' +
                '<input type="text" class="select-value" data-val={{chosePre.fval}} name="{{autoChose}}" id="{{id}}" v-model="chosePre.fcn" readonly >' +
                '<span class="caret"></span>' +
            '</div>' +
            '<template v-if="type!=\'search\'">' +
                '<div class="dropdown-menu scroll-stand" style="display:none">' +
                    '<template v-if="type==\'single\'">' +
                        '<ul>' +
                            '<li data-val="" >' +
                                '<label v-on:click="chose($event)">...</label>' +
                            '</li>' +
                            '<li v-for="item in list"  data-val={{item[customField.val]}} >' +
                                '<label v-on:click="chose($event)">{{item[customField.cn]}}</label>' +
                            '</li>' +
                        '</ul>' +
                    '</template>' +
                    '<template v-if="type==\'multi\'">' +
                        '<ul>' +
                            '<li v-for="item in list" v-on:click="chose($event)" data-val={{item[customField.val]}} >' +
                                '<input type="checkbox" id=\'multi{{$index}}\'/><label for=\'multi{{$index}}\'>{{item[customField.cn]}}</label>' +
                            '</li>' +
                        '</ul>' +
                    '</template>' +
                '</div>' +
                '</template>' +
                '<template v-else>' +
                    '<div class="dropdown-menu dropdown-menu-search scroll-stand " style="display:block">' +
                        '<head-search :form="search.form" :search-fun="searchFun" :revoke-fun="revokeFun"></head-search>'+
                        '<div class="table-con">'+
                        '<p class="select-table-title">请点击选择：'+
                            '<template v-for="item in multiCn">'+
                                '<span> {{item}} <a href="javascript:void(0);" @click="deleteChose($index)" class="icon-remove"></a></span>'+
                            '</template>'+
                        '</p>'+
                        '<table-stand :list="table.list" :thead="table.thead" :must="table.must" :url="table.url" :click-fun="clickFun"></table-stand>'+
                        '</div>'+
                    '</div>' +
                '</template>' +
        '</div>' +
    '</div>',
    props: ['position', 'search','table',   
    'infoType', 'type','id', 'readonly', 'localdata', 'auth', 'url', 'autoChose','autoChoseCn', 'afterChose', 'beforeChose', 'spreadEvent','customField','paras','linkage'], 
    data: function(){
        return {
            list: '', //选项fcodeKey,fcodeValue_cn或者自定义
            chosePre: {
                fval: '',
                fcn: ''
            }, //当前选中
            willChose: '',//要选择的值，避免还未返回数据时要选中值的情况
            islistReady: false,
            multi: [], //存储分隔好的多选数据
            multiCn:[],
            // statu: false //状态，是否显示
            //autoChose 自动选择的对应form字段的key
            //customField 自定义值和文字字段customField{val:asd,cn:asd}
            //spreadEvent展开事件
            //paras自定义参数
            //type==search 除了autoChose，还需要autoChoseCn
            searchFun: function (data) {  
                var self = this.$parent;
                self.$children[1].setSearch(data);
                // console.log(this.url)
                // $.ajax({
                //     url: self.url,
                //     type: "GET",
                //     cache: false,
                //     dataType: 'JSON',
                //     data: self.must,
                //     success: function (data) {
                //         this.$parent.$children[1].setData(data)
                //     }
                // });
                self.$children[1].refresh();
            },
            revokeFun: function () { 
                this.$parent.$children[1].clearSearch();
             },
             //table
             clickFun: function (data) { 
                 var self = this.$parent;
                 for(var i = 0; i<self.multi.length;i++)
                 {
                     if(self.multi[i] == data[self.customField.val]) return false
                 }
                 self.multi.push(data[self.customField.val]);
                 self.multiCn.push(data[self.customField.cn]);
                 self.chosePre.fval = self.multi.join(',');
                 self.chosePre.fcn = self.multiCn.join(',');

             }
            
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
            else if(this.url&&!this.linkage) {
                //默认请求地址
                self.req(self.paras);
            }
        }
        else {
            this.list = this.localdata;
        }
    },
    methods: {
        deleteChose: function (index) {  
            this.multi.splice(index,1);
            this.multiCn.splice(index,1);
            this.chosePre.fval = this.multi.join(',');
            this.chosePre.fcn = this.multiCn.join(',');
        },
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
        req: function (paras) { 
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
                            self.choseSome(self.willChose);
                            self.willChose = '';
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
                        this.multi.push(allInput[i].parentNode.getAttribute('data-val'));
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
        choseSome: function (codekey) {
            //如果数据还未就绪，缓存要选择的值
            if (!this.islistReady) {
                this.willChose = codekey;
                return
            }
            if (codekey !== '' && codekey !== null && codekey !== undefined) {
                if (this.type == 'single') {
                    var targetData;
                    this.chosePre.fval = codekey;
                    this.chosePre.fcn = this.searchData(codekey);
                    this.afterChose && this.afterChose(this.chosePre);
                }
                else if (this.type == 'multi') {
                    this.chosePre.fval = codekey;
                    this.multi = codekey.split(',');
                    this.multiCn = this.searchData(this.multi);
                    this.chosePre.fcn = this.searchData(this.multi).join(',');
                    this.afterChose && this.afterChose(this.chosePre);
                }
                else if(this.type == 'search')
                {
                    //绑定cn
                    this.chosePre.fval = codekey;
                    this.chosePre.fcn = this.searchData(this.multi).join(',');
                    this.multi = this.chosePre.val.split(',');
                    this.multiCn = this.chosePre.cn.split(',');
                }

            }
            else {
                this.chosePre.fval = '';
                this.chosePre.fcn = '';
            }
        },
        //根据加载好的字段val选中，主要是multi类型
        check: function () {  
            if(this.type=='multi')
            {
                var inputs = this.$el.getElementsByClassName('dropdown-menu')[0].getElementsByTagName('LI');
                var inputAttr;
                for(var i =0; i < inputs.length;i++)
                {
                    inputAttr = inputs[i].getAttribute('data-val');
                    for(var m =0; m<this.multi.length;m++)
                    {
                        if(inputAttr == this.multi[m])
                        {
                            inputs[i].querySelector('input').checked = true;
                        }
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
            if(thisSelect.style.display =='block')
            {
                thisSelect.style.display ='none';
            }
            else{
                thisSelect.style.display ='block';
                if(this.type == 'multi')
                {

                }
                this.spreadEvent&&spreadEvent();
            }
        }
    },
    events: {
        'formDataReady': function (msg) {
            if(this.autoChose)
            {
                switch (this.type)
                {
                    case 'single': 
                        this.choseSome(msg[this.autoChose]);
                    break;
                    case 'multi': 
                        this.choseSome(msg[this.autoChose]);
                        this.check();
                    break;
                    case 'search': 
                        // this.choseSome(msg[this.autoChose]);
                        this.chosePre.fval = msg[this.autoChose];
                        this.chosePre.fcn = msg[this.autoChoseCn];
                        this.multi = this.chosePre.val.split(',');
                        this.multiCn = this.chosePre.cn.split(',');
                    break;
                }
                // if(this.type=='multi' || this.type == "search")
                // {
                    

                // }
                
                // if(this.type == 'single')
                // {
                //     this.choseSome(msg[this.autoChose]);
                // }
                
            }
        },
        'formAdd': function () {
            this.choseSome();
        },
        //清除选中
        'clear': function () {
            this.choseSome();
        }
    }
});