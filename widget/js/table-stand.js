Vue.component('table-stand', {
    template: '<div class="vue-table">'+
            '<div class="table-par">'+
                '<table class="table-stand">'+
                    '<thead>'+
                        '<tr>'+
                            '<th v-for="item in thead" width="{{item.width}}">{{item.name}}</th>'+
                        '</tr>'+
                    '</thead>'+
                    '<tbody>'+
                        '<tr v-for="item in list.results" v-on:click="req($event,\'single\')" v-on:dblclick="req($event,\'double\')"  data-fid={{mark&&item[mark]||item.fid}}>'+
                            '<template v-for="item2 in thead">'+ 
                                '<template v-if="typeof item2.getter == \'undefined\'">'+ 
                                    '<td title={{item[item2.field]}}>{{item[item2.field]}}</td>'+
                                '</template>'+
                                '<template v-else>'+ 
                                    '<td>{{item2.getter(item[item2.field])}}</td>'+
                                '</template>'+
                            '</template>'+
                        '</tr>'+
                    '</tbody>'+
                '</table>'+
            '</div>'+
            '<div class="loding-con" style="display:none">'+
                '<p class="loding table-loding">'+
                    '<span></span>'+
                    '<span></span>'+
                    '<span></span>'+
                    '<span></span>'+
                    '<span></span>'+
                    '<span></span>'+
                '</p>'+
            '</div>'+
            '<div class="table-control">'+
                '<select name="" id="select-page" v-model="list.pageSize" v-on:change="pgChange(1)">'+
                    '<option v-bind:value="option.value" v-for="option in autoPage">{{option.text }}</option>'+
                '</select>'+
                '<p>'+
                    '<a class="pageUp" v-on:click="pageUp">&lt;</a>'+
                    '<span>'+
                        '<b :class="{\'active\':page.active==1}" v-on:click="pgChange(2)" pagev=1>1</b>'+
                        '<em v-show="page.order==\'head\'||page.order==\'all\'">···</em>'+
                        '<b v-for="item in page.five" :class="{\'active\':item==page.active}" v-on:click="pgChange(2)" pagev={{item}}>'+
                        '{{item}}'+
                        '</b>'+
                        '<em v-show="page.order==\'tail\'||page.order==\'all\'">···</em>'+
                        '<template v-if="page.tp>1">'+
                            '<b :class="{\'active\':page.active==page.tp}" v-on:click="pgChange(2)" pagev={{page.tp}}>'+
                            '{{page.tp}}'+
                            '</b>'+
                        '</template>'+
                    '</span>'+
                    '<a class="pageDown" v-on:click="pageDown">&gt;</a>&nbsp;&nbsp;&nbsp;'+
                    '<span>'+
                        '共&nbsp;{{page.tr}}&nbsp;条'+
                    '</span>'+
                '</p>'+
                '跳转到'+
                '<input type="number" id="" v-model="skipNum" max = "{{page.tp}}" min="0">'+
                '<a href="javascript:;" v-on:click="pgChange(3)"><i class="icon-arrow-right"></i></a>'+
                '<a href="javascript:;" v-on:click="pgChange(1)"><i class="icon-refresh"></i></a>'+
            '</div>'+
        '</div>',
    props: ['list', 'thead', 'skipNum', 'must', 'url','clickFun','dbclickFun','handLoad','mark','search'],
    data: function () {
        return {
            "num": 0,
            "fids": '', //当选选中项目的fid
            "autoPage": '', //自动页数
            "valChose":'',
            "domChose": {}
            // "pageList":page
        }
    },
    ready: function () {
        var self=this;
        if(this.list==undefined||this.list==null)
        {
            this.list = {
                currentPage:1,
                pageSize: 10,
                totalPage: 1
            };
            if(document.documentElement.clientHeight>820)
            {
                this.list.pageSize = 15;
            }
            //todo整合高度
            
        }
        if(!this.search)
        {
            this.search={};
        }
        if(!this.must)
        {
            this.must={
                currentPage:1,
                pageSize: 10,
            };
        }
        if(this.url&&this.url!=''&&!this.handLoad)
        {
            var dataFinal = {};
            for (newPara in this.must) {
                dataFinal[newPara] = this.must[newPara]
            }
            for (newPara in this.search) {
                dataFinal[newPara] = this.search[newPara]
            }
            this.loding(1);
            $.ajax({
                url: self.url,
                type: "GET",
                cache: false,
                dataType: 'JSON',
                data: self.must,
                success: function (data) {
                    self.list = data;
                    self.loding(0);
                    
                },
                error: function () { 
                    self.loding(0);
                 }
            });
        }
        
        //自动更改高度
        setTimeout(function(){
            self.autoHei(); 
        },200)
        window.addEventListener('resize', this.autoHei, false);
    },
    methods: {
        //刷新表格
        refresh: function(){
            this.pgChange(4);
        },
        clearSearch: function () {  
            this.search = {};
        },
        setSearch: function (data) {  
            for(var i in data)
            {
                this.search[i]=data[i]
            }
        },
        //更改页码相关,ty=1刷新，ty=2更改页码，ty=3跳转到某页，ty = 4 搜索
        pgChange: function (ty) {
            if(this.list==undefined||this.list==null)
            {
                this.list = {
                    currentPage:1,
                    pageSize: 15,
                    totalPage: 1
                };
            }
            this.num++;
            var num2 = this.num;
            var self = this;
            var dataFinal = {};
            //增加必须和搜索参数
            for (newPara in this.must) {
                dataFinal[newPara] = this.must[newPara]
            }
            for (newPara in this.search) {
                dataFinal[newPara] = this.search[newPara]
            }
            dataFinal.pageSize = self.list.pageSize;
            dataFinal.currentPage = ty == 1 && self.list.currentPage || ty == 2 && event.target.getAttribute('pagev') || ty == 3 && self.skipNum||ty == 4 && 1;
            if(this.list.totalPage == 0)
            {
                this.list.totalPage = 1;
            }
            if(dataFinal.currentPage<=0||dataFinal.currentPage>this.list.totalPage)
            {
                warnFull('超出范围！','red');
                return false
            }
            this.loding(1);
            $.ajax({
                url: self.url,
                type: "GET",
                cache: false,
                dataType: 'JSON',
                data: dataFinal,
                success: function (data) {
                    if (num2 == self.num) {
                        self.list = data;
                        self.loding(0);
                        self.fids='';
                        self.valChose='';
                    }
                },
                error: function () { 
                    self.loding(0);
                 }
            });
        },
        //点击active,获取fid
        req: function (e,clickType) {
            var trs;
            var self = this;
            if (e.target.tagName == 'TD') {
                this.fids = e.target.parentNode.getAttribute('data-fid');
                trs = e.target.parentNode.parentNode.getElementsByTagName('TR');
                for (var i = 0; i < trs.length; i++) {
                    trs[i].className = '';
                }
                this.domChose = e.target.parentNode;
                e.target.parentNode.className = 'active';
            }
            else if (e.target.tagName == 'TR') {
                this.fids = e.target.getAttribute('data-fid');
                trs = e.target.parentNode.getElementsBytagName('TR');
                for (var i = 0; i < trs.length; i++) {
                    trs[i].className = '';
                }
                this.domChose = e.target;
                e.target.className = 'active';
            }
            var item = this.searchData(this.list.results,this.fids);
            this.valChose = item; //todo变量名valchose
            if(clickType == 'single')
            {
                item && this.clickFun && this.clickFun(item)

            } else{
               item && this.dbclickFun && this.dbclickFun(item);

            }
            
            // rightInfo.req(fids);
        },
        //更改Table高度及确定可选择的条数
        autoHei: function () {
            // var $content = document.getElementsByClassName('content-list')[0];
            var $content = this.$el.parentNode.parentNode;
            if(!$content) {
                return
            }
            var top = $content.getElementsByClassName('cl-head')[0].offsetHeight;
            var hei = this.$el.offsetHeight - top;
            $content.getElementsByClassName('table-con')[0].style.top = top + 'px';
            // var hei = this.$el.offsetHeight;
            var selectPage = [];
            var i = 5;
            do {
                selectPage.push({
                    "value": i,
                    "text": i
                });
                i = i + 5
            }
            while (i * 35 <= hei)
            if (this.list&&this.list.pageSize > selectPage[selectPage.length - 1].value) {
                this.list.pageSize = selectPage[selectPage.length - 1].value;
            }
            this.autoPage = selectPage;
        },
        setData: function(data){
            this.list = data;
        },
        //寻找并返回数据
        searchData: function(datas,fids) {
            if(!this.mark)
            {
                for (var i = 0;i < datas.length;i++)
                {
                    if(fids == datas[i].fid){
                        return datas[i]
                    }
                }
            }
            else{
                for (var i = 0;i < datas.length;i++)
                {
                    if(fids == datas[i][this.mark]){
                        return datas[i]
                    }
                }
            }
            
        },
        //上一条
        prev: function(){
            var allTr = this.$el.querySelector('TBODY').querySelectorAll('TR');
            if(this.valChose)
            { 
                for( var  i = 0 ; i < allTr.length ; i++)
                {
                    if(allTr[i].className.indexOf('active')!=-1)
                    {
                        if(i == 0)
                        {
                            // this.pageUp();
                            // warnTop('已经到顶了');
                            return false
                        }else{
                            allTr[i].className = '';
                            allTr[i-1].className = 'active';
                            this.fids = allTr[i-1].getAttribute('data-fid');
                            this.valChose = this.searchData(this.list.results,this.fids);
                            return this.valChose;
                        }
                    }
                }
            }
            else{
                allTr[allTr.length-1].className = 'active';
                this.fids = allTr[allTr.length-1].getAttribute('data-fid');
                this.valChose = this.searchData(this.list.results,this.fids);
                return this.valChose;
            }
        },
        next: function(){
            var allTr = this.$el.querySelector('TBODY').querySelectorAll('TR');
            if(this.valChose)
            { 
                for( var  i = 0 ; i < allTr.length ; i++)
                {
                    if(allTr[i].className.indexOf('active')!=-1)
                    {
                        if(i == allTr.length-1)
                        {
                            // this.pageDown();
                            // warnTop('已经到底了');
                            return false
                        }else{
                            allTr[i].className='';
                            allTr[i+1].className='active';
                            this.fids = allTr[i+1].getAttribute('data-fid');
                            this.valChose = this.searchData(this.list.results,this.fids);
                            return this.valChose;
                        }
                    }
                }
            }
            else{
                allTr[0].className = 'active';
                this.fids = allTr[0].getAttribute('data-fid');
                this.valChose = this.searchData(this.list.results,this.fids);
                return this.valChose;
            }

        },
        pageDown: function(){
            if(this.list.currentPage<this.list.totalPage)
            {
                this.list.currentPage++;
                this.pgChange(1);
            }
        },
        pageUp: function(){
            if(this.list.currentPage > 1)
            {
                this.list.currentPage--;
                this.pgChange(1);
            }

        },
        loding: function (para) { 
            if(para)
            {
                this.$el.querySelector('.loding-con').style.display='block';
            }
            else
            {
                this.$el.querySelector('.loding-con').style.display='none';
            }
         },


    },
    computed: {
        //处理页码部分的数据（从表格数据里）
        page: function () {
            var pageObj = {
                "tp": this.list.totalPage,//总页数 
                "tr": this.list.totalRecord,//总页数 
                "active": this.list.currentPage,//目前选中
                "five": [],//中间五个数字不包括头尾
                "order": '',//省略号位置 head tail none all
                "ps": this.list.pageSize//每页的条目数量
            };
            if (this.list.totalPage <= 7) {
                pageObj.order = 'none';
                for (var i = 2; i < this.list.totalPage; i++) {
                    pageObj.five.push(i);
                }
            }
            else {
                if (pageObj.active - 3 > 1 && pageObj.active + 3 < pageObj.tp) {
                    pageObj.order = 'all';
                    for (var i = pageObj.active - 2; i <= pageObj.active + 2; i++) {
                        pageObj.five.push(i);
                    }
                }
                else if (pageObj.active - 3 > 1 && pageObj.active + 3 >= pageObj.tp) {
                    pageObj.order = 'head';
                    for (var i = pageObj.tp - 5; i < pageObj.tp; i++) {
                        pageObj.five.push(i);
                    }
                }
                else if (pageObj.active - 3 <= 1 && pageObj.active + 3 < pageObj.tp) {
                    pageObj.order = 'tail';
                    for (var i = 2; i <= 6; i++) {
                        pageObj.five.push(i);
                    }
                }
            }
            return pageObj
        }
    },
    events: {
    }
});