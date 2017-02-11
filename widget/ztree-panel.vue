<template>
    <div class="content-right content-right-organ">
                    <div class="class-cr clearfix">
                        <a class="item-btn hover">
                            <i class="icon-pencil"></i>
                            <span class="operName1">{{title}}</span>
                        </a>
                        <p class="item-list2">
                            <a href="javascript:;" class="item-btn item-btn1" v-on:click="saveMess()"><i class="icon-ok"></i></a>
                            <a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class="icon-remove"></i></a>
                        </p>
                    </div>
                    <div class="content-con">
                        <div class="title-list-fold">
                            <p class="title-switch" href="javascript:;">
                                <span>{{title}}</span>
                            </p>
                            <div id="{{treeId}}" class="ztree">
                            </div>
                        </div>
                        <div class="loding-con" style="display:none">
                            <p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>
                        </div>
                    </div>
                </div>
</template>

<script>
module.exports = {
    props:['ztreeSet','title','treeId','saveFun','closeFun','linkCN','linkValue'],
    //todo 赋值
    data: function(){
        return {
            statu: 'close',
            messSource: false, //是否是广播的事件的源头
            chosePre: {
                val: '',
                cn: ''
            }
        }
    },
    ready: function(){
        var setting = this.ztreeSet;
        var self = this;
        $.fn.zTree.init($("#"+self.treeId), self.ztreeSet);
    },
    methods: {
        open: function() {
            var self = this;
            this.$el.style.right = '0px';
            this.messSource = true;
            this.$parent.$broadcast('ztree-panel', 'open');
            this.statu ='open';
        },
        close: function() {
            var self = this;
            this.$parent.$broadcast('ztree-panel', 'close');            
            this.$el.style.right = '-390px';
            this.statu ='close';
            this.clear();
        },
        clear: function(){
            this.chosePre = {
                val: '',
                cn: ''
            }
        },
        check: function (id) {
            var filter,isMulti;
            this.open();
            var treeObj = $.fn.zTree.getZTreeObj(this.treeId);
            if(this.ztreeSet.check)
            {
                isMulti = this.ztreeSet.check.enable ;
            }
            else{
                isMulti = false
            }
            treeObj.cancelSelectedNode();
            //判断是否自定义了搜索字段和是都多选
            if(typeof id == 'object')
            {
                for(var i in id)
                {
                    id[i] =  String(id[i]);
                    id[i] = id[i].split(',');
                    
                    for( var m = 0 ; m < id[i].length; m++ )
                    {
                        filter = function (node) {
                            return (node[i] == id[i][m]);
                        };
                        node = treeObj.getNodesByFilter(filter, true);
                        if(!isMulti)
                        {
                            node && treeObj.selectNode(node);
                        }
                        else{
                            node && treeObj.checkNode(node, true);
                        }
                        
                    }
                    
                }
                
            }
            else{
                id =  String(id);
                id = id.split(',');
                for( var m = 0 ; m < id.length; m++ )
                {
                    filter = function (node) {
                        return (node.fid == id[m]);
                    };
                    node = treeObj.getNodesByFilter(filter, true);
                    if(!isMulti)
                    {
                        node && treeObj.selectNode(node);
                    }
                    else{
                        node && treeObj.checkNode(nodes, true);
                    }
                    
                }
            }
            // debugger
            // if(filter)
            // {
            //     if(!this.ztreeSet.check.enable)
            //     {
            //         var node = treeObj.getNodesByFilter(filter, true);
            //             node && treeObj.selectNode(node);
            //     }
            //     else{
            //         if(typeof id == "object")
            //         {
            //             var node
            //             for(var m = 0;m<id.length;m++){
            //                 filter = function (node) {
            //                     return (node.fid == id[m]);
            //                 };
            //                 node = treeObj.getNodesByFilter(filter, true);
            //                 node && treeObj.checkNode(nodes, true);
            //             }
            //         }
            //     }
            // }
        },
        saveMess: function(){
            this.saveFun();
        }
    },
    events: {
        'form-panel':function(msg){
            if(msg=='close')
            {
                this.$el.style.right = '-390px';
                this.statu ='close';
            }
        },
        'ztree-panel':function(msg){
            if(msg=='open')
            {
                if(!this.messSource)
                {
                    this.$el.style.right = '-390px';
                    this.statu ='close';
                }
                else{
                    this.messSource=false;
                }
            }
        }
    }
}
</script>
<style>
    
</style>
