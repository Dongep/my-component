<template>
    <div>
                <div class="ros-pop" style="display:none;">
                    <p class="pop-title">
                        {{title}}
                        <span class="item-list2">
                            <template v-if="saveFun">
                                <a href="javascript:;" class="item-btn item-btn1" v-on:click="save()"><i class=" icon-ok"></i>保存</a>
                            </template>
                            <a href="javascript:;" class="item-btn item-btn2" v-on:click="close()"><i class=" icon-remove"></i>关闭</a>
                        </span>
                    </p>
                    <div class="pop-con">
                        <div class="loding-con" style="display:none">
                            <p class="loding"><span></span><span></span><span></span><span></span><span></span><span></span></p>
                        </div>
                        <slot>
                            <div class="role-pop">
                                <role-pop :items="items" :padding="0">
                                </role-pop>
                            </div>
                        </slot>
                        
                    </div>
                </div>
                <div class="shade"></div>
            </div>
</template>

<script>
module.exports = {
    props: ['title','url','saveFun','customScreen','width','height','closeFun'], 
    data: function(){
        return {
            items: '',
            statu: 'close',
            init: false,
            source: ''
        }
    },
    ready: function(){
        var self = this;
        //如果是自定义宽高，防止宽高超出范围
        if(this.customScreen)
        {
            this.$el.querySelector('.ros-pop').className="ros-pop custom-screen-pop";
            var width = document.documentElement.clientWidth;
            var height = document.documentElement.clientHeight;
            width = width > this.width? this.width:width;
            height = height > this.height? this.height:height;
            this.$el.querySelector('.ros-pop').style.cssText="display:none;position:absolute;width: "+width+"px;height:"+height+"px;margin: 0;";
            window.addEventListener('resize',function(){
                width = document.documentElement.clientWidth;
                height = document.documentElement.clientHeight;
                width = width > self.width? self.width:width;
                height = height > self.height? self.height:height;
                self.$el.querySelector('.ros-pop').style.width=width+"px";
                self.$el.querySelector('.ros-pop').style.height=height+"px";
            },false)
        }
        //获取数据
        if(this.url)
        {
            self.$el.querySelector('.loding-con').style.display='block';
            
            $.ajax({
                url: self.url,
                type: "GET",
                cache: false,
                dataType: 'JSON',
                success: function (data) {
                    self.items = data;
                    self.$el.querySelector('.loding-con').style.display='none';
                },
                error: function () { 
                    self.$el.querySelector('.loding-con').style.display='none';
                 }
            });
        }
        
    },
    methods: {
        open: function () {
            if(!this.init)
            {
                this.init = true;
            }
            this.$el.querySelector('.ros-pop').style.display = 'block';
            this.$el.querySelector('.shade').style.display = 'block';
            this.statu = 'open';
        },
        close: function () {
            this.$el.querySelector('.ros-pop').style.display = 'none';
            this.statu = 'close';
            this.$el.querySelector('.shade').style.display = 'none';
            this.source='';
            this.closeFun&&this.closeFun();
        },
        //选中
        check: function (id) {
            if(id)
            {
                var $inputs = this.$el.querySelector('.pop-con').getElementsByTagName('input');
                //            var ids = rightInfo.items.roleIds;
                var fid = '', m = 0;
                var ids = id.split(',');
                if (ids) {
                    for (var i = 0; i < $inputs.length; i++) {
                        fid = $inputs[i].getAttribute('fid');
                        $inputs[i].checked = false;
                        for (m = 0; m < ids.length; m++) {
                            if (fid == ids[m]) {
                                $inputs[i].checked = true;
                                break
                            }
                        }
                    };
                }
                else {
                    for (var i = 0; i < $inputs.length; i++) {
                        fid = $inputs[i].getAttribute('fid');
                        $inputs[i].checked = false;
                    };
                }
            }
            this.open();
        },
        save: function () {
            var $inputs = this.$el.querySelector('.ros-pop').getElementsByTagName('input');
            var inputCheckedId = [], inputCheckedName = [];
            for (var i = 0; i < $inputs.length; i++) {
                if ($inputs[i].checked) {
                    inputCheckedId.push($inputs[i].getAttribute('fid'));
                    inputCheckedName.push($inputs[i].getAttribute('namerole'));
                }
            }
            // for(var m = 0; m < this.filed.length ; m++)
            // {
            //     this.filed[0] = inputCheckedName.join(',');
            //     this.filed[0] = inputCheckedId.join(',');                
            // }
            this.saveFun(inputCheckedName.join(','),inputCheckedId.join(','))
            this.close();
        }
        
    }
}
</script>
<style>
    
</style>
