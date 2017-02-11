Vue.component('menu-ztree',{
    template: '<div class="content-left" id ="content-left">'+
                '<p href="#" class="scrollbtn slt" style="display:none">'+
                    '<i class="icon-sort-up"></i>'+
                '</p>'+
                '<p href="#" class="scrollbtn slb" style="display:none">'+
                    '<i class="icon-sort-down"></i>'+
                '</p>'+
                '<div class="scroll" id="ztree-scroll">'+
                    '<div class="ztree" id="{{treeId}}">'+
                    '</div>'+
                '</div>'+
              '</div>',
    props: ['ztreeSet','treeId'], //ztree设置和id设置
    ready: function(){
        var setting = this.ztreeSet;
        // if(this.ztreeSet.async&&this.ztreeSet.async.enable)
        // {
            $.fn.zTree.init($("#"+ this.treeId), this.ztreeSet);
        // }
        scrollZtree('content-left','ztree-scroll');
        if(this.$parent&&this.$parent.$el.querySelector('.content-list'))
        {
            this.$parent.$el.querySelector('.content-list').style.left = "170px";
        }
    },
    methods: {

    }
});