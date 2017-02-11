//vue日历
Vue.component('calendar', {
    template: '<div class="calendar-custom">' +
    '            <div class="calendar-head">' +
    '                <p class="date">' +
    '                    <a href="javascript:void(0);" class="btn-left" v-on:click="monthCut">' +
    '                        <i class="icon-angle-left"></i>' +
    '                    </a>' +
    '                    <a href="javascript:void(0);" class="btn-right" v-on:click="monthAdd">' +
    '                        <i class="icon-angle-right"></i>' +
    '                    </a>' +
    '                    <span><b>{{year}}</b>年<b>{{month+1}}</b>月</span>' +
    '                </p>' +
    '            </div>' +
    '            <p class="week clearfix">' +
    '                <span>周一</span>' +
    '                <span>周二</span>' +
    '                <span>周三</span>' +
    '                <span>周四</span>' +
    '                <span>周五</span>' +
    '                <span>周六</span>' +
    '                <span>周日</span>' +
    '            </p>' +
    '            <div class="days-con">' +
        '            <ul class="days clearfix">' +
        '                <li v-for="item in days.prev" class="none" track-by="$index">' +
        '                    <b>{{item}}</b>' +
        '                    <span "></span>' +
        '                </li>' +
        '                <li v-for="item in days.now" :class="{\'none\': year == yearNow && month == monthNow &&  item > dayNow }" v-on:click="click(item)" track-by="$index">' +
        '                    <b>{{item}}</b>' +
        '                    <span :class="{\'green\':  statuPre[item-1] == 1,\'red\':  statuPre[item-1] == 2,\'empty\':  statuPre[item-1] == 3 }"></span>' +
    
        '                </li>' +
        '                <li v-for="item in days.next" class="none" track-by="$index">' +
        '                    <b>{{item}}</b>' +
        '                    <span"></span>' +
        '                </li>' +
        '            </ul>' +
    '            </div>' +
                '<template v-if="url">'+
        '            <p class="statis">' +
        '                <span class="status green"></span>' +
        '                正常出勤<b>{{fattnCount}}</b>天&nbsp;' +
        '                <span class="status red"></span>' +
        '                迟到<b>{{flateCount}}</b>次&nbsp;' +
        '                <span class="status red"></span>' +
        '                早退<b>{{fleaveCount}}</b>次&nbsp;' +
        '                <span class="status red"></span>' +
        '                旷工<b>{{fabsenceCount}}</b>次' +
        '            </p>' +
                '</template>'+
    
    '        </div>',
    props: ['clickFun','url','monthChangeFun','clearFun'],
    data: function () {
        return {
            days: [],//某个月份的日期视图
            statuPre: [],//每天签到状态
            fabsenceCount: '', //旷工天数
            fattnCount: '',//出勤天数
            flateCount:'', //迟到次数
            fleaveCount: '',//早退次数
            year: '',
            month: '', //0-11
            day: '',
            week:'',
            yearNow: '',
            monthNow: '',
            dayNow: '',
            weekNow:'',
            firstDayWeek:'',
            late: '',
            leaveEarly: '',
            workNone: '',
            active:'',
            fpersonId:'',
            numCount: 1
        }
    },
    ready: function () {
        var self = this;
        // this.req();
        this.year = this.yearNow =this.today().year;
        this.month = this.monthNow = this.today().month;
        this.day = this.dayNow = this.today().day;
        this.week = this.weekNow = this.today().week;
        var day = this.dayNow;
        var week = this.weekNow;
        var firstDayWeek = this.weekNow; //1号是周几
        var firstWeekDay = this.dayNow - parseInt(this.dayNow / 7) * 7  ; //第一个星期的今天对应的日期
        if(firstWeekDay==0)
        {
            firstWeekDay = 7;
        }
        for (var i = firstWeekDay; i > 1; i--) {
            //得到1号是周几
            week--;
            if (week < 0) {
                week = 6;
            }
        }
        // for (var i = 1; i < firstWeekDay; i++) {
        //     //得到1号是周几
        //     firstDayWeek--;
        //     if (firstDayWeek < 1) {
        //         firstDayWeek = 7;
        //     }
        // }
        this.firstDayWeek = week;
        this.days = this.monthView(this.year,this.month);
        this.chose(this.dayNow);
    },
    methods: {
        clear: function(){
            if(this.active)
            {
                this.active.className = '';
                this.active = null;
            }
            this.clearFun&&this.clearFun();
        },
        req: function (datas) {  //datas: fmonth,fpersonId
            // debugger
            // if(!this.url) return
            if(datas&&datas.fpersonId) //从外部请求的时候需要处理用于显示year month格式，不需要处理data格式
            {
                this.fpersonId = datas.fpersonId;
                this.year = datas.month.split('-')[0];
                this.month = parseInt(datas.month.split('-')[1])-1;
                this.days = this.monthView(this.year,this.month)
            } 
            else{
                //从内部请求不需要处理year month格式但是需要处理datas
               var datas = {
                   month: this.year +'-' + (((this.month+1)<10&&('0'+(this.month+1)))||(this.month+1)),
                   fpersonId: this.fpersonId
               } 
               this.days=this.monthView(this.year,this.month)
            }
            if(this.url){
                this.numCount++;
                var numCount = this.numCount;
                var self = this;
                $.ajax({
                    url: self.url,
                    type: "GET",
                    cache: false,
                    dataType: 'JSON',
                    data: datas,
                    success: function (data) {
                        if(self.numCount == numCount)
                        {
                            // self.statuPre = data;
                            self.statuPre = self.statusCalc(data.attnList);
                            self.fabsenceCount=data.fabsenceCount;
                            self.flateCount=data.flateCount;
                            self.fleaveCount=data.fleaveCount;
                            self.fattnCount=data.fattnCount;
                        }
                    }
                });
            }
            
        },
        today: function () {  
            var dates = new Date();
            var years = dates.getFullYear();
            var months = dates.getMonth();
            var days = dates.getDate();
            var weeks = dates.getDay(); //今天周几
            return {
                year: years,
                month: months,
                day: days,
                week: weeks
            }
        },
        click: function (text) {
            
            var et = event.target.tagName == "LI" && event.target || event.target.parentNode;
            if(et.className!='none')
            {
                this.day = text;
                var date = this.year+'-'+((this.month+1)<10&&('0'+(this.month+1))||(this.month+1))+'-'+(text<10&&('0'+text)||text);
                this.clickFun(date,this.fpersonId);
                if(this.active)
                {
                    this.active.className = '';
                }
                this.active = et;
                
                et.className = 'active';
            }        
        },
        chose: function (day) {  

        },
        statusCg: function (text) {
            return text == 1 && 'green' || text == 2 && 'red' || text == 3 && 'empty' 
        },
        statusCalc: function (data) {
            if(data)
            {
                var status = [];
                var allStatus = data;
                for(var i=0;i< allStatus.length;i++)
                {
                status [parseInt(allStatus[i].fdate.split('-')[2])-1] = allStatus[i].status;
                }
                return status
            }  
        },
        monthCut: function () {
            if (this.month > 0) {
                this.month--;
            }
            else {
                this.month = 11;
                this.year --;
            }
            this.days = this.monthView(this.year,this.month);
            if(this.active)
            {
                this.active.className = '';
            }
            this.statuPre = {};
            this.monthChangeFun&&this.monthChangeFun();
            this.req();

        },
        monthAdd: function () {
            if(this.year == this.yearNow&&this.month < this.monthNow||this.year < this.yearNow)
            {
                if (this.month < 11) {
                    this.month++;
                }
                else {
                    this.month = 0;
                    this.year ++;
                }
                this.days = this.monthView(this.year,this.month);
                if(this.active)
                {
                    this.active.className = '';
                }
                this.statuPre = {};
                this.monthChangeFun&&this.monthChangeFun();
                this.req();
            }
            else {
                return false
            }
            
            
        },
        //计算月视图
        monthView: function (year,month){
            this.statuPre =[];
            var dayDisplay = {
                prev: [],
                now: [],
                next:[]
            }; //显示出来的日期数组
            var daysAll = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (parseInt(this.yearNow / 4) * 4 == this.yearNow) {
                daysAll[1] = 29;
            }
            var yearGap = this.yearNow - year;
            var length = yearGap * 12 + this.monthNow - month; //差多少个月
            var daysGap = 0,monthCount = this.monthNow,yearCount = this.yearNow; 
            
                
            for(var i = 0; i<length;i++ )
            {
                monthCount --;
                if(monthCount<0)
                {
                    monthCount = 11;
                    yearCount--;
                    if (parseInt(yearCount / 4) * 4 != yearCount) {
                        daysAll[1] = 28;
                    }
                    else{
                        daysAll[1] = 29;
                    }
                }
                daysGap = daysGap + daysAll[monthCount];
            }
            var firstWeekDay = daysGap-parseInt(daysGap/7)*7 + 1; //+1是因为本月1号
            if(firstWeekDay==0)
            {
                firstWeekDay = 7;
            }
            var firstDayWeek = this.firstDayWeek;
            if(year!=this.yearNow||year == this.year&&month!=this.monthNow)
            {
                for (var d = firstWeekDay; d > 1; d--) {
                //得到1号是周几
                    firstDayWeek--;
                    if (firstDayWeek < 0) {
                        firstDayWeek = 6;
                    }
                }
            }

            // if (parseInt(year / 4) * 4 == year) {
            //     daysAll[1] = 29;
            // }
            
            // debugger
            var month2 = month - 1;
            var year2 = year;
            if(month2 <0)
            {
                month2 = 11;
            }
            for (var m = 1 ; m < firstDayWeek; m++) {
                dayDisplay.prev.push(daysAll[month2]-firstDayWeek+m);
            }
            for (var n = 1; n <= daysAll[month]; n++) {
                dayDisplay.now.push(n);
            }
            for(var next = 1 ; next <= (42-dayDisplay.now.length-dayDisplay.prev.length);next++){
                dayDisplay.next.push(next);
            }
            // this.days=[];
            return dayDisplay;

            // console.log(this.days)
            // return dayDisplay
        },
        
    },
    computed: {
        late: function () {
            return 3
        },
        leaveEarly: function () {
            return 3
        },
        workNone: function () {
            return 3
        }
    },
    events: {
        'form-panel': function (msg) {
            if (msg == 'close') {
                this.$el.style.right = '-390px';
            }
        }
    }
});