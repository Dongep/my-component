<template>
    <div class="content-right">
                <div class="class-cr clearfix">
                    <a class="item-btn hover">
                        <i class="icon-pencil"></i>
                        <span class="operName1">{{opeType=='add'&&'新增'||opeType=='edit'&&'编辑'||opeType=='view'&&'查看'||' '}}</span>
                    </a>
                    <p class="item-list2">
                        <a href="javascript:;" class="item-btn item-btn1" v-on:click="saveMess()" v-show="opeType!='view'"><i class=" icon-ok"></i></a>
                        <a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class=" icon-remove"></i></a>
                    </p>
                </div>
                <div class="content-con">
                    <div class="title-list-fold">
                        <template v-if="form.title">
                            <p class="title-switch">
                                <span>{{form.title}}</span>
                            </p>
                        </template>
                        <template v-for="item in form.data">
                            <template v-if="!item.select">
                                <div class="form-group">
                                    <label>{{item.name}}</label>
                                    <input type="text" class="form-control" v-model="formData[item.field]" data-val="formData[item.dataField]" required v-bind:readonly="item.readonly==true&&readAdd||readonly" v-on:click="item.operaFun&&inputOpera(item.operaFun)">
                                </div>
                            </template>
                            <template v-else>
                                <div class="form-group">
                                    <label>{{item.name}}</label>
                                    <select-stand :info-type="item.select.infoTypes" :type="item.select.types" :readonly="readonly" :auto-chose="item.field" :localdata="item.select.localdata" :url="item.select.url" :after-chose="item.select.afterChose" :before-chose="item.select.beforeChose" :custom-field="item.select.customField" :spread-event="item.select.spreadEvent" :paras="item.select.paras" :link-field="item.select.linkField">
                                    </select-stand>
                                </div>
                            </template>
                        </template>
                        <template v-if="statusForm.title">
                            <p class="title-switch">
                                <span>{{statusForm.title}}</span>
                            </p>
                        </template>
                        <template v-for="item in statusForm.data">
                            <div class="form-group">
                                <label>{{item.name}}</label>
                                <input type="text" class="form-control" v-model="formData[item.field]" required v-bind:readonly= "true" >
                            </div>
                        </template>
                        <template v-if="passWordOpera.title">
                            <p class="title-switch" href="javascript:;">
                                <span>{{passWordOpera.title}}</span>
                            </p>
                        </template>
                        <template v-for="item in passWordOpera.data">
                            <p class="lock-con">
                                <i class="icon-lock"></i>
                                <button v-on:click="item.operaFun()" class="btn btn-disabled" disabled>{{item.name}}</button>
                            </p>
                        </template>
                    </div>
                    <div class="loding-con" style="display:none">
                        <p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>
                    </div>
                </div>
              </div>
</template>

<script>
module.exports = {
    props: ['saveUrl','reqUrl','form','statusForm','passWordOpera','refresh','saveFun','openFun','closeFun','afterSaveFun'],
    data: function(){
        return {
            opeType: '', //操作类型,add,view,edit
            opeFid: '', //被操作fid
            num: 0,
            statu: '', //开关状态
            formData:'',
            selectGroup: [],
            
        }
        
    },
    ready: function(){
        var form=this.form.data;
        for(var i=0;i<form.length;i++)
        {
            if(form[i].select)
            {
                this.selectGroup.push(i)
            }
        }

    },
    methods: {
        open: function(type) {
            this.$el.style.right = '0px';
            this.opeType = type;
            this.statu = 'open';
            if(type == 'add')
            {
                this.$broadcast('formAdd');
            }
            this.openFun&&this.openFun();
        },
        close: function() {
            this.$el.style.right = '-390px';
            this.$parent.$broadcast('form-panel', 'close');    this.statu = 'close';      
            this.opeType = '';
            this.opeFid = '';
            this.closeFun&&this.closeFun();
        },
        req: function(fidpre,type) {
            this.num++;
            var num2 = this.num;
            var self = this;
            this.$el.getElementsByClassName('loding-con')[0].style.display = 'block';
            this.open(type);
            //请求数据资料
            $.ajax({
                url: self.reqUrl,
                type: "GET",
                cache: false,
                dataType: 'JSON',
                data: {"fid": fidpre},
                success: function (data) {
                    if (num2 == self.num) {
                        self.formData = data;
                        self.opeFid = fidpre;
                        self.$broadcast('formDataReady',data);
                        self.$el.getElementsByClassName('loding-con')[0].style.display = 'none';
                        //访问select
                        // for(var i=0;i<self.selectGroup.length;i++)
                        // {
                        //     self.$children[i].choseSome(data[self.form.data[self.selectGroup[i]].field])
                        // }
                        // selectStatu.$refs.select1.choseSome(self.items.fcodeType)
                    }
                },
                error:function () { 
                    if(self.$el.querySelector('.loding-con'))
                    {
                        self.$el.querySelector('.loding-con').style.display='none';
                    }
                 }
            });
        },
        saveMess: function() {
            var self = this;
            //获取子组件的值
            for(var i=0;i<self.selectGroup.length;i++)
            {
                this.formData[this.form.data[this.selectGroup[i]].field] = self.$children[i].val();
            }
            if(!this.saveFun)
            {
                
                if (this.opeType == 'add' || this.opeType == 'edit') {
                    //todo验证
                    $.ajax({
                        url: self.saveUrl,
                        type: "GET",
                        cache: false,
                        dataType: 'JSON',
                        data: self.formData,
                        success: function (data) {
                            self.close();
                            warnTop('保存成功！');
                            self.afterSaveFun&&self.afterSaveFun();
                            // self.refresh();
                            // content.$refs.table1.pgChange(1);
                        },
                        error:function () { 
                            if(self.$el.querySelector('.loding-con'))
                            {
                                self.$el.querySelector('.loding-con').style.display='none';
                            }
                        }
                    });
                } else {
                    self.close();
                }
            }
            else{
                this.saveFun();
                this.afterSaveFun&&this.afterSaveFun();
            }
            

        },
        //如果只读，操作函数失效
        inputOpera: function(fun){
            if(!this.readonly)
            {
                fun();
            }
        }

    },
    computed:{
        readonly: function (){
            return this.opeType=='view'&&true||false
        },
        readAdd: function (){
            return this.opeType!='add'&&true||false
        }
    },
    events: {
        'ztree-panel':function(msg){
            if(this.statu == 'open')
            {
                if(msg=='open')
                {
                    this.$el.style.right = '340px'
                }
                else if(msg=='close'){
                    this.$el.style.right = '0px';
                }
            }
            
        }
    }
}
</script>
<style>
    
</style>
