/**
 * section-drag-control/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'span',
  classNames:['layout-control'],
  sectionComponent:null,
  layoutCoordinator: Ember.inject.service('layout-coordinator'),

  mouseDown(event){
    this.get('layoutCoordinator').checkDrag(event, this.get('sectionComponent'));
  }
});
