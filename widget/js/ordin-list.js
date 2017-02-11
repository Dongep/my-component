var ordinListVue = Vue.component('ordin-list',{
    template: '<div class="fold-list ordin-list">'+
                '<table class="table-stand table-stand-head">'+
                    '<thead>'+
                        '<tr>'+
                            '<template v-if="columnHead">'+
                                '<th width="{{columnHead.width}}"></th>'+
                            '</template>'+
                            '<template v-if="serialNum">'+
                                '<th width="40"></th>'+
                            '</template>'+
                            '<th v-for="item in head"  width="{{item.width}}">{{item.name}}</th>'+
                            '<th v-if=\'viewFun\'>操作</th>'+
                        '</tr>'+
                    '</thead>'+
                '</table>'+
                '<div class="fold-list-main scroll-stand">'+
                    '<table class="table-stand">'+
                        '<thead>'+
                            '<tr>'+
                               '<template v-if="columnHead">'+
                                    '<th width="{{columnHead.width}}"></th>'+
                                '</template>'+
                                '<template v-if="serialNum">'+
                                    '<th width="40"></th>'+
                                '</template>'+
                                '<th v-for="item in head"  width="{{item.width}}"></th>'+
                                '<th v-if=\'viewFun\'></th>'+
                            '</tr>'+
                        '</thead>'+
                    // '<div class="fold-list-main scroll-stand">'+
                        '<tbody>'+
                            '<template v-if="!columnHead">'+
                                '<tr v-for="item in list" fid="{{mark&&item[mark]||item.fid}}">'+
                                    '<template v-if="serialNum">'+ 
                                        '<td>{{($index+1)}}</td>'+
                                    '</template>'+
                                    '<template v-for="headItem in head">'+
                                        '<template v-if="typeof headItem.getter == \'undefined\'">'+ 
                                            '<td title={{item[headItem.field]}}>{{item[headItem.field]}}</td>'+
                                        '</template>'+
                                        '<template v-else>'+ 
                                            '<td>{{headItem.getter(item[headItem.field])}}</td>'+
                                        '</template>'+
                                    '</template>'+
                                    '<td fid="{{item.fid}}" v-if=\'viewFun\'>'+
                                        '<a href="javascript:;">查看</a>'+
                                        '<template v-for="item2 in opera">'+
                                            '<i class="vertical"></i>'+
                                            '<a href="javascript:;" >{{item2.name}}</a>'+
                                        '</template>'+
                                    '</td>'+
                                '</tr>'+
                            '</template>'+
                            '<template v-else>'+
                                    '<tr v-for="item2 in columnHead.name" fid="{{$index}}">'+
                                        '<td>{{item2}}</td>'+
                                        // '<template v-for="headItem in head">'+
                                        //     '<template v-if="typeof headItem.getter == \'undefined\'">'+ 
                                        //         '<span>{{list[$index][headItem.field]}}</span>'+
                                        //     '</template>'+
                                        //     '<template v-else>'+ 
                                        //         '<span>{{headItem.getter(list[$index][headItem.field])}}</span>'+
                                        //     '</template>'+
                                        // '</template>'+
                                        '<template v-for="headItem in head">'+
                                            '<template v-if="typeof headItem.getter == \'undefined\'">'+ 
                                                '<td title={{list[headItem.field[$parent.$index]]}}>{{list[headItem.field[$parent.$index]]}}</td>'+
                                            '</template>'+
                                            '<template v-else>'+ 
                                                '<td>{{headItem.getter(list[headItem.field[$parent.$index]],headItem.field[$parent.$index])}}</td>'+
                                            '</template>'+
                                        '</template>'+
                                        '<td fid="{{list[$index].fid}}" v-if=\'viewFun\'>'+
                                            '<a href="javascript:;">查看</a>'+
                                            '<template v-for="item2 in opera">'+
                                                '<i class="vertical"></i>'+
                                                '<a href="javascript:;" >{{item2.name}}</a>'+
                                            '</template>'+
                                        '</td>'+
                                    '</tr>'+
                            '</template>'+
                            
                        '</tbody>'+
                    // '</div>'+
                    '</table>'+
                '</div>'+                
                '<div class="loding-con" style="display:none">'+
                    '<p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>'+
                '</div>'+
              '</div>',
    props: ['url','head','must','opera','itemClick','viewFun','mark','columnHead','serialNum'],
    data: function(){
        return {
            list: {},
            fid: '',//当前选中
            numCount: 0
        }
    },
    ready: function(){
        var self=this;
        if(self.url)
        {
            self.$el.querySelector('.loding-con').style.display='block';
            $.ajax({
                url : self.url,
                type : "GET",
                dataType :"JSON",
                success : function(data){
                    self.list=data;
                    self.$el.querySelector('.loding-con').style.display='none';
                },
                error: function () { 
                    if(self.$el.querySelector('.loding-con'))
                    {
                        self.$el.querySelector('.loding-con').style.display='none';
                    }
                 }
            });
        }
        
        //监听所有click事件
        this.$el.addEventListener('click',function(e){
            var fids;
            var targetData;
            if(e.target.tagName=='A')
            {
                fids = e.target.parentNode.parentNode.getAttribute('fid');
                self.fid=fids;
                targetData = self.searchData(self.list,fids);
                if(e.target.innerHTML=='查看')
                {
                    self.viewFun&&self.viewFun(targetData);
                }
                else
                {
                    for(var i=0;i<self.opera.length;i++)
                    {
                        if(e.target.innerHTML == self.opera[i].name)
                        {
                            self.opera[i].operaFun(targetData);
                        }
                    }

                }
                
            }
            else if(e.target.tagName=='TD')
            {
                fids = e.target.parentNode.getAttribute('fid');
                self.fid = fids;
                //双表头模式传入index
                if(!self.columnHead)
                {
                    targetData = self.searchData(self.list,fids);
                    if(e.target.parentNode.tagName=='TR')
                    {
                        self.numCount++;
                        self.itemClick&&self.itemClick(targetData);
                    }
                }
                else{
                    if(e.target.parentNode.tagName=='TR')
                    {
                        self.numCount++;
                        self.itemClick&&self.itemClick(fids,self.list);
                    }
                }
                
            }
            else { return}
            var lis = self.$el.getElementsByTagName('TR');
            for(var i = 0; i< lis.length; i++)
            {
                lis[i].className = '';
            }
            self.findParent(e.target,'TR').className = 'active';

        },false)
    },
    methods: {
        clearData: function(){
            this.fid='';
            this.list={};
        },
         findParent: function (child, parent) {
            var ulp = child, num = 0;
            while (ulp.tagName != parent && num < 10) {
                ulp = ulp.parentNode;
                num++;
            };
            return ulp;
        },
        setData: function(listData){
            this.list = listData;
            this.$el.querySelector('.loding-con').style.display = 'none';
        },
        searchData: function(datas,fids) {
            if(this.mark)
            {
                for (var i = 0;i < datas.length;i++)
                {
                    if(fids == datas[i][this.mark]){
                        return datas[i]
                    }
                }
            }
            else{
                for (var i = 0;i < datas.length;i++)
                {
                    if(fids == datas[i].fid){
                        return datas[i]
                    }
                }
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
        refresh: function(){
            var self=this;
            if(self.url)
            {
                this.loding(1);
                $.ajax({
                    url : self.url,
                    type : "GET",
                    dataType :"JSON",
                    success : function(data){
                        self.list=data;
                        this.loding();
                    },
                    error: function () { 
                        if(self.$el.querySelector('.loding-con'))
                        {
                            this.loding();
                        }
                    }
                });
            }
        }

    }
});