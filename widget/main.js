import Vue from 'vue'
import calendar from './calendar.vue'
// import foldList from './fold-list.vue'
// import foldListMain from './fold-list-main.vue'
// import formPanel from './form-panel.vue'
// import formPanelPro from './form-panel-pro.vue'
// import headOpera from './head-opera.vue'
// import headSearch from './head-search.vue'
// import ordinList from './ordin-list.vue'
// import pop from './pop.vue'
// import rolePop from './role-pop.vue'
// import selectStand from './select-stand.vue'
// import tableStand from './table-stand.vue'
// import upload from './upload.vue'
// import ztreePanel from './ztree-panel.vue'


// var test = require('./test.vue');

Vue.component('calendar', calendar)
// new Vue({
//   el: 'body',
//   components:{
//       'calendar': calendar
//     },
//     data: function () {  
//           return {
//             cfs: function () { 
//               console.log(0)
//               console.log(this.url);
            
//            }
//           }
//         },
// });

// (function () {
//     var isselect = false;//是否在select-stand内
//     // $('body').on('click', '.btn-select', function (e) {
//     //     if ($(this).parent().attr('class').indexOf('readonly') == -1) {
//     //         $(this).next().toggle();
//     //         // $(this).next().css('display','block');
//     //     }
//     // })
//     // $("body").on('click', '.dropdown-menu', function (e) {
//     //     $(this).toggle();
//     // });
//     $('body').on('mouseenter', '.select-stand', function () {
//         isselect = true;
//     });
//     $('body').on('mouseleave', '.select-stand', function () {
//         isselect = false;
//     });
//     $('body').on('click', function () {
//         !isselect && $('.select-stand .dropdown-menu').css('display', 'none')
//     });
// } ());