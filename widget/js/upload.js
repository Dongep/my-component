Vue.component('upload', {
    template: '<div class="drop-upload" style="display:none">'+ 
            ' <template v-if="form"> '+
                '<div class="form-panel">'+
                    '<p class="title-switch">'+
                        '<span>{{formTitle||"请先选择过滤条件"}}</span>'+
                    '</p>'+
                    '<form>'+
                    '<template v-for="item in form">'+
                            '<template v-if="item.type==\'text\'||item.type==\'number\'||item.type==\'file\'||item.type==\'password\'||item.type==\'email\'">'+
                    '            <div :class="[\'form-group\',item.validate&&item.validate.required&&\'required\',item.roasnm&&\'roasnm\']">'+
                    '                <label>{{item.name}}{{item.ps}}</label>'+
                    '                <input type="{{item.type}}"  id="{{item.id}}" name="{{item.field}}" class="form-control" accept="{{item.accept}}" checked="{{item.checked}}" v-model="formData[item.field]" max="{{item.max}}" min="{{item.min}}" maxlength="{{item.maxlength}}" multiple="{{item.multiple}}" v-bind:readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly" v-on:click="item.operaFun">'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'date\'">'+
                                '<div :class=[\'form-group\',\'roasnm\',\'form-group-date\',item.validate&&item.validate.required&&\'required\']>'+
                                    '<label>{{item.name}}</label>'+
                    '                <input type="text"  id="{{item.id}}" :readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly" class="form-control" name="{{item.field}}"  v-model="formData[item.field]">'+
                                '</div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'radio\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\',item.validate&&item.validate.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <template v-for="item2 in item.radio">'+
                    '                    <span class="form-chose">'+
                    '                        <input type="radio" name="{{item.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]" :disabled="item2.disabled==true&&readAdd||item2.disabled==\'ever\'&&true||disabled">'+
                    '                        <label for="{{item2.id}}">{{item2.name}}</label>'+
                    '                    </span>'+
                    '                </template>'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'checkbox\'">'+
                    '            <div :class="[\'form-group\',\'form-group-long\',item.validate&&item.validate.required&&\'required\']">'+
                    '                <label>{{item.name}}</label>'+
                    '                <template v-for="item2 in item.checkbox">'+
                    '                    <span class="form-chose">'+
                    '                        <input type="checkbox" name="{{item.field}}" id="{{item2.id}}" value="{{item2.value}}" v-model="formData[item.field]"  :disabled="item2.disabled==true&&readAdd||item2.disabled==\'ever\'&&true||disabled">'+
                    '                        <label for="{{item2.id}}">{{item2.name}}</label>'+
                    '                    </span>'+
                    '                </template>'+
                    '            </div>'+
                    '        </template>'+
                    '        <template v-if="item.type==\'select\'">'+
                                '<div :class="[\'form-group\',item.validate&&item.validate.required&&\'required\']">'+
                                    '<label>{{item.name}}</label>'+
                                    '<select-stand :id="item.id" :name="item.field" :info-type="item.select.infoTypes" :type="item.select.type" :readonly="item.readonly==true&&readAdd||item.readonly==\'ever\'&&true||readonly" :auto-chose="item.field" :auto-chose-cn="item.select.fieldCn" :localdata="item.select.localdata" :url="item.select.url" :after-chose="item.select.afterChose" :before-chose="item.select.beforeChose" :custom-field="item.select.customField" :spread-event="item.select.spreadEvent" :paras="item.select.paras" :link-field="item.select.linkField">'+
                                    '</select-stand>'+
                                '</div>'+
                    '        </template>'+
                        '</template>'+
                        '</form>'+
                '    </div>'+
                '</template>'+
    '           <div >'+
// '               <div class="drop-file-block">'+
//     '                可以将文件拖拽到此处'+
// '               </div>'+
    '            <label for="choseFile" class="chose-file-block">将文件拖拽到此处，或者点此选择文件</label>'+
                '<input type="file" class="chose-file-input" v-on:change="readFile($event)" :multiple="type==\'multi\'" :accept="fileType.join(\',\')" id="choseFile">'+
                
                '<a href="javascript:void(0);" v-on:click="uploadFile" class="btn btn-stand btn-upload">上传</a>'+
                '<a href="javascript:;" class="item-btn item-btn2 upload-close"><i class="icon-remove" v-on:click="close"></i></a>'+
                '<template v-if="progressBar">'+
                    '<p class="file-upload">'+
                        '<i class="icon-paper-clip"></i>'+
                        '<span class="file-name">{{filesName}}</span>'+
                        // '<a href="javascript:;">x</a>'+
                        '<span class="percentage"><b>{{size}}{{unit}}</b> / <b>{{progress}}</b></span>'+
                        '<em class="progress" :style="{ width: progress}"></em>'+
                    '</p>'+
                '<template/>'+
'        </div>'+
'    </div>',
    props: ['type','url','fileType','successFun','form'],//type单选多选
    data: function () {
        return {
            files:[],
            filesName: [], 
            formData: {}, 
            selectGroup: [], 
            progress: '0%', 
            status: false, //是否在上传中
            unit:'', //大小单位
            size: '', //大小
            progressBar: false, //进度条的状态
        }
    },
    ready: function () {
        var self = this;
        this.valiSet={
            debug: true,
            onsubmit: false,
            onkeyup:false,
            errorElement: 'p',
            errorClass:'form-wrong',
            rules: {

            }
        };
        //初始化form
        if(this.form)
        {
            var form = this.form;
            for(var i=0;i< this.form.length;i++)
            {
                Vue.set(this.formData,this.form[i].field,'');
                //select
                if(form[i].type=='select')
                {
                    this.selectGroup.push(i)
                }
                //date
                else if(form[i].type=='date'){
                    // console.log(0)
                    // laydate(form[i].date);
                    if(!form[i].id) console.log('date组件需要配置id')
                    $('#'+form[i].id).datetimepicker(form[i].date);

                }
                if(form[i].validate)
                {
                    this.valiSet.rules[form[i].field] = form[i].validate;
                }
            }
            this.validateFun = $(this.$el.querySelector('form')).validate(this.valiSet);
        }
        //默认的文件类型是excel
        if(!this.fileType){
            this.fileType=['application/vnd.ms-excel.sheet.binary.macroEnabled.12','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel'];
        }
        //添加拖放事件
        // var $drop = this.$el.querySelector('.drop-file-block');
        var $drop = this.$el.querySelector('.chose-file-block');
        
        $drop.addEventListener('dragover',function(e){
            //阻止默认行为才能触发目标元素的drop事件
            e.preventDefault();
        },false)
        
        $drop.addEventListener('dragenter',function(e){
            $drop.className = 'chose-file-block hover';
        },false)
        $drop.addEventListener('dragleave',function(e){
            $drop.className = 'chose-file-block';
        },false)
        $drop.addEventListener('drop',function(e){
            e.preventDefault();
            $drop.className = 'chose-file-block';
            var files = e.dataTransfer.files;
            if((!self.type||self.type=="single")&&files.length>1) {
                warnFull('每次只能接受一个文件！');
                return
            }
            for(var i = 0 ; i< files.length; i++)
            {
                for(var m = 0; m < self.fileType.length;m++)
                {
                    if(files[i].type==self.fileType[m])
                    {
                        break;
                    }
                    if(m==self.fileType.length-1)
                    {
                        warnFull('文件 \"'+files[i].name+'\" 格式有误','red');
                        return
                    }
                }
                if(i == files.length-1)
                {
                    self.files = e.dataTransfer.files;
                    self.$el.querySelector('#choseFile').value='';
                    // self.$el.querySelector('.chose-file-block').innerHTML='点击选择文件';
                    $drop.innerHTML = files.length==1&&files[0].name || (files.length+'个文件')
                }
                
            }
        },false)
    },
    methods: {
        open: function () { 
            this.$el.style.display='block';
        },
        close: function () {  
            this.$el.style.display='none';
            this.reset();
        },
        reset: function(){
            this.files=[];
            this.filesName = '';
            this.$el.querySelector('.chose-file-block').innerHTML = "将文件拖拽到此处，或者点此选择文件";
            this.$el.querySelector('#choseFile').value='';
            this.status = false;
        },
        readFile: function (e) {  
            this.files = e.target.files;
            this.$el.querySelector('.chose-file-block').innerHTML = e.target.files.length==1&&e.target.files[0].name || (e.target.files.length + '个文件');
            // this.$el.querySelector('.drop-file-block').innerHTML= '将文件拖拽到此处';
            // this.uploadFile(file);
        },
        uploadFile: function (files) {
            if(this.form)
            {
                if(!this.validateFun.form()) {
                    return false;
                }
            }
            
            var self = this;
            //获取子组件的值
            for(var i=0;i<self.selectGroup.length;i++)
            {
                this.formData[this.form[this.selectGroup[i]].field] = this.$children[i].val();
            } 
            if(!this.files.length) {
                warnFull('请先选择文件')
                return;
            }
            var self = this; 
            //默认单个上传
            if(!self.type||self.type=="single")
            {
                if(this.status) return
                var filesName = this.files[0].name;
                for(var i = 0 ; i< this.fileType.length; i++)
                {
                    if(this.files[0].type==this.fileType[i]) break
                }

                if(i==this.fileType.length) return false;//文件格式不符
                //新formData,添加文件及条件
                var newFormData = new FormData();
                newFormData.append('file',this.files[0]);
                for(var i in this.formData)
                {
                    newFormData.append(i,this.formData[i]);
                }
                //计算大小及单位
                var size = this.files[0].size;
                var sizeTs = size/1024;
                var unit = 'KB';
                if(sizeTs>1000)
                {
                    sizeTs = size/1024;
                    unit = 'MB';
                }
                sizeTs = sizeTs.toFixed(2);
                self.size = sizeTs;
                self.unit = unit;

                //请求
                var xhr = new XMLHttpRequest;
                xhr.open('POST',self.url,true);
                // xhr.setRequestHeader("Content-Type","multipart/form-data;charset=utf-8");
                xhr.upload.addEventListener("progress", function(e) {  
                    var progress = e.loaded/size*100;
                    if(progress>=100)
                    {
                        progress = 100;
                        // self.filesName = '';
                        // warnFull('上传成功！后台处理数据中');
                        // self.$el.querySelector('.chose-file-block').innerHTML= '将文件拖拽到此处，或者点此选择文件';
                        // self.$el.querySelector('#choseFile').value='';
                        // self.files = [];
                        // self.successFun&&self.successFun();
                    } 
                    self.progress = progress +'%';
                }, false); 
            //     xhr.timeout = 5000;
            //     xhr.ontimeout = function(event){
            //         warnFull('请求超时！','red');
            // 　　};
                // xhr.onload = function(e) {
                //     self.progressBar = false;
                //     if (xhr.status == 200) {
                //         self.$el.querySelector('.drop-file-block').innerHTML= '将文件拖拽到此处';
                //         self.$el.querySelector('#choseFile').value='';
                //         self.$el.querySelector('.chose-file-block').innerHTML='点击选择文件';
                //         self.files = [];
                //         self.successFun&&self.successFun(xhr);
                //     } else {
                //         warnFull(JSON.parse(xhr.responseText).message,'red')
                //     }
                // };

                xhr.onreadystatechange = function(data){
                    if(xhr.readyState==2)
                    {
                        self.filesName = filesName;
                        self.progressBar = true;
                        this.status = true;
                    }
                    else if(xhr.readyState==4 )
                    {

                        this.status = false;
                        if(xhr.status == 200)
                        {
                            self.reset();
                            self.progressBar = false;
                            warnTop('上传成功！后台处理数据中');
                            self.successFun&&self.successFun(xhr);
                        }else {
                            if(xhr.responseText)
                            {
                                warnFull(JSON.parse(xhr.responseText).message,'red');
                                self.progressBar = false;
                                self.progress = 0;

                            }

                        }
                    } 
                    // if(xhr.readyState==4&&xhr.status>=200&&xhr.status<300)
                    // {
                    //     self.progressBar = false;
                    // }
                    // else if(xhr.readyState==4&&xhr.status>300)
                    // {
                    //     self.progressBar = false;
                    //     warnFull(JSON.parse(xhr.responseText).message,'red');
                    // }
                };
                xhr.send(newFormData);
            }
            else if(self.type=="multi"){
                //todo多选上传
            }
        }
    }

});