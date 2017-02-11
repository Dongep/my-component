Vue.component('fold-list',{
    template: '<div class="fold-list">'+
        '            <p class="fold-list-head">'+
        '                <span></span>'+
        '                <span v-for="item in head" >{{item.name}}</span>'+
        '                <span>操作</span>'+
        '            </p>'+
        '            <div class="fold-list-main scroll-stand">'+
        '                <ul v-bind:class="{\'role-open\':item.childrenList}" v-for="item in list" order={{$index}} >'+
        '                    <fold-list-main :item="item" :head="head" :opera="opera" :mark="mark" :top-delete="topDelete"></fold-list-main>'+
        '                </ul>'+
        '            </div>'+
                    
                    '<div class="loding-con" style="display:none">'+
                        '<p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>'+
                    '</div>'+
        '        </div>',
    props: ['url','head','must','opera','itemClick','viewFun','mark','topDelete'],
    data: function(){
        return {
            list:'',
            fid: '',
            numCount: true,
            lastActiveLi: ''
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
                error:function () { 
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
                    self.viewFun(targetData);
                }
                else
                {
                    for(var i=0;i<self.opera.length;i++)
                    {
                        if(e.target.innerHTML==self.opera[i].name)
                        {
                            self.opera[i].operaFun(targetData);
                        }
                    }

                }
                self.active(e);
                
                
            }
            else if(e.target.tagName=='SPAN'&&e.target != e.target.parentNode.getElementsByTagName('span')[0])
            {
                fids = e.target.parentNode.getAttribute('fid');
                self.fid = fids;
                targetData = self.searchData(self.list,fids);
                if(e.target.parentNode.tagName == 'LI')
                {
                    //点击本栏
                    self.itemClick&&self.itemClick(targetData);
                }
                self.active(e);
            };
            
            

        },false)
    },
    methods: {
        findParent: function (child, parent) {
            var ulp = child, num = 0;
            while (ulp.tagName != parent && num < 10) {
                ulp = ulp.parentNode;
                num++;
            };
            return ulp;
        },
        active: function(e){
            var li = this.findParent(e.target,'LI');
            if(self.lastActiveLi)
            {
                self.lastActiveLi.className = '';
            }

            li.className = 'active';
            self.lastActiveLi = li;
        },
        setData: function(listData, numCount2){
                this.list = listData;
                this.$el.querySelector('.loding-con').style.display = 'none';

        },
        searchData: function(datas,fids) {
            var success = false,target = null;
            var deep = 0;
            var circu;
            if(!this.mark)
            {
                circu = function(dataSin,fidCp){
                    deep ++;
                    if(deep<10){ 
                        for (var i = 0;i < dataSin.length;i++)
                        {
                            if(fidCp == dataSin[i].fid){
                                over = dataSin[i] ;
                                success = true;
                                target = dataSin[i];
                                return
                            }
                            else if( dataSin[i].childrenList.length>0){
                                // path[deep] = i;
                                circu(dataSin[i].childrenList,fidCp);
                            }
                            if(success)  return 
                        }
                    }
                    deep --;
                };
            }
            else
            {
                circu = function(dataSin,fidCp){
                    deep ++;
                    if(deep<10){ 
                        for (var i = 0;i < dataSin.length;i++)
                        {
                            if(fidCp == dataSin[i][this.mark]){
                                over = dataSin[i] ;
                                success = true;
                                target = dataSin[i];
                                return
                            }
                            else if( dataSin[i].childrenList.length>0){
                                // path[deep] = i;
                                circu(dataSin[i].childrenList,fidCp);
                            }
                            if(success)  return 
                        }
                    }
                    deep --;
                };

            }
            circu(datas,fids);
            return target;
        },
        refresh: function(){
            var self=this;
            if(self.url)
            {
                $.ajax({
                    url : self.url,
                    type : "GET",
                    dataType :"JSON",
                    success : function(data){
                        self.list=data;
                    }
                });
            }
        }
    }
    
});
Vue.component('fold-list-main', {
    template: '<li fid={{item.fid}}>'+
'            <span v-on:click.stop="switch">'+
'                <a href="javascript:;" class="switchul" v-on:click.stop="switch"><i class="icon-angle-right"></i></a>'+
'            </span>'+
            '<template v-for="headItem in head">'+
                '<template v-if="typeof headItem.getter == \'undefined\'">'+ 
                    '<span>{{item[headItem.field]}}</span>'+
                '</template>'+
                '<template v-else>'+ 
                    '<span>{{headItem.getter(item[headItem.field])}}</span>'+
                '</template>'+
            '</template>'+
'            <span fid="{{item.fid}}">'+
                '<a href="javascript:;">查看</a>'+
                '<template v-if="topDelete">'+
                    '<template v-for="item2 in opera">'+
                        '<i class="vertical"></i>'+
                        '<a href="javascript:;" >{{item2.name}}</a>'+
                    '</template>'+
                '</template>'+
                
'            </span>'+
'        </li>'+
'        <li v-for="item2 in item.childrenList"  fid={{item2.fid}}>'+
'            <template v-if="item2.childrenList.length>0">'+
'                <ul v-bind:class="{\'role-open\':true}" order={{$index}}>'+
'                    <fold-list-main :item="item2" :head="head" :opera="opera" :mark="mark" :top-delete="true"></fold-list-main>'+
'                </ul>'+
'            </template>'+
'            <template v-else>'+
'                <span>'+
'                </span>'+
'                <span v-for="headItem in head">{{item2[headItem.field]}}</span>'+
'                <span>'+
                    '<a href="javascript:;">查看</a>'+
                    '<template v-for="item2 in opera">'+
                        '<i class="vertical"></i>'+
                        '<a href="javascript:;" >{{item2.name}}</a>'+
                    '</template>'+
'                </span>'+
'            </template>'+
'        </li>',
    //数据和左填充
    props: ['item','head','opera','mark','topDelete'],
    data: function(){
        return {
        }
    },
    methods: {
        //寻找父元素
        findParent: function (child, parent) {
            var ulp = child, num = 0;
            while (ulp.tagName != parent && num < 10) {
                ulp = ulp.parentNode;
                num++;
            };
            return ulp;
        },
        //折叠功能
        switch: function (e) {
            var ulp = this.findParent(e.target, 'UL');
            var lihei = ulp.getElementsByTagName('li');
            if (ulp.className == 'role-open') {
                ulp.className = 'role-close';
                ulp.style.height = lihei[0].offsetHeight + 'px';
            }
            else if (ulp.className == 'role-close') {
                ulp.className = 'role-open';
                ulp.style.height = 'auto';
            }
        }
    }
});