import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: ['page-layout-editor'],

  hasSections: Ember.computed('model.sections.length', function() {
    return this.get('model.sections.length') > 0;
  }),


  /**
   * Get the event bus
   */
  eventBus: Ember.inject.service('event-bus'),

  dragEnter(event){
    let td = this.get('eventBus.transferData');

    if(td.objectType==='section'){
      console.info('PAGE-LAYOUT-EDITOR VALID DROP TARGET FOR ' + td.objectType);
      event.preventDefault()
    }
  },

  dragOver(event){
    //can accept a section
    let td = this.get('eventBus.transferData');

    if(td.objectType==='section'){
      console.info('PAGE-LAYOUT-EDITOR VALID DROP TARGET FOR ' + td.objectType);
      event.preventDefault()
    }
  },

  drop(event){
    let td = this.get('eventBus.transferData');
    console.info('DROP ON PAGE-LAYOUT-EDITOR ' + this.get('elementId') + ' for ' + td.objectType);

  },

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
