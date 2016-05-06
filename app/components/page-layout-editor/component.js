import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: ['page-layout-editor'],

  // drop(e) {
  //   const dragOverRow = this.get('dragOverRow');
  //   this.sendAction('onDrop', e, dragOverRow);
  //   this.set('dragOverRow', null);
  // },

  hasRows: Ember.computed('rows.length', function() {
    return this.get('rows.length') > 0;
  }),

  actions: {
    onRowDrop(e, row) {
      this.sendAction('onDrop', e, row, this.get('moveRow'));
      this.set('moveRow', null);
    },
    onStartMove(e, row) {
      this.set('moveRow', row);
    }
    // onRowDragEnter(row) {
    //   this.set('dragOverRow', row);
    //   // console.log('entered row', row.message);
    // },
    // onRowDragLeave(row) {
    //   if (this.get('dragOverRow') === row) {
    //     this.set('dragOverRow', null);
    //   }
    //   // console.log('leaving row', row.message);
    // }
  }
});
