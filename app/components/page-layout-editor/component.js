/**
 * page-layout-editor/component.js
 */
import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: ['page-layout-editor'],
  classNameBindings: ['actionInProgress:disable-user-select'],
  hasSections: Ember.computed('model.sections.length', function() {
    return this.get('model.sections.length') > 0;
  }),

  dropTargetModel: null,


  /**
   * Get the coordinator service
   */
  layoutCoordinator: Ember.inject.service('layout-coordinator'),

  init(){
    this._super(...arguments);
    //add this to the layoutCoordinatior
    this.set('layoutCoordinator.layoutEditor', this);
  },
  willDestroyElement(){
    this.set('layoutCoordinator.layoutEditor', null);
  },


  insertSection(section, targetSection, dockPosition) {
    const sections = this.get('model.sections');
    // where to insert?
    // default to the begining (left)
    let pos = 0;
    if (targetSection) {
      // if inserting before, use target card's current index
      // otherwise (inserting after) use the next index
      pos = sections.indexOf(targetSection);
      if(dockPosition ==='bottom'){
        pos++;
      }
    }
    sections.insertAt(pos, section);
  },

  _removeSection(section){
    console.info('PAGE-LAYOUT-EDITOR _removeSection');
    this.set('model.sections', this.get('model.sections').without(section));
  },

  actions: {
    // onRowDrop(e, row) {
    //   this.sendAction('onDrop', e, row, this.get('moveRow'));
    //   this.set('moveRow', null);
    // },
    // onStartMove(e, row) {
    //   this.set('moveRow', row);
    // },
    onRemoveSection(sectionModel){
      console.info('PAGE-LAYOUT-EDITOR onRemoveSection');
      this._removeSection(sectionModel);
    },
    onEditSection(sectionModel){
      console.info('PAGE-LAYOUT-EDITOR onEditSection');
    }
  }
});
