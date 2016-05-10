import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: ['page-layout-editor'],

  hasSections: Ember.computed('model.sections.length', function() {
    return this.get('model.sections.length') > 0;
  }),
  
  dropTargetModel: null,

  /**
   * Get the event bus
   */
  eventBus: Ember.inject.service('event-bus'),

  init(){
    this._super(...arguments);
    //event handler to listen to eventBus
    this.get('eventBus').on('showDropTarget', this, 'onShowDropTarget');
    this.get('eventBus').on('hideDropTarget', this, 'onHideDropTarget');
  },

  willDestroyElement(){
    this.get('eventBus').off('showDropTarget', this, 'onShowDropTarget');
    this.get('eventBus').off('hideDropTarget', this, 'onHideDropTarget');
  },

  /**
   * Drop-Target is a shared control across the entire
   * page-layout. It's used to show the location of a
   * drop target. By using a shared element, we can
   * only have one active at a time.
   */
  onShowDropTarget(dropTargetModel){
    console.log('onShowDropTarget ', dropTargetModel);
    this.set('dropTargetModel', dropTargetModel);
    this.$('.drop-target').css({display:'block'});
  },

  /**
   * Simply hide the Drop-Target
   */
  onHideDropTarget(){
    this.$('.drop-target').css({display:'none'});
  },

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
    if(td){
      console.info('DROP ON PAGE-LAYOUT-EDITOR ' + this.get('elementId') + ' for ' + td.objectType);
    }


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
