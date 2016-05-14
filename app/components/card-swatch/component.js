/**
 * card-swatch/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-swatch'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  dragType: Ember.computed('model.dragType', function(){
    return this.get('model.dragType');
  }),
  dragAction:'add', //dragging a swatch is always an ADD
  mouseDown(event){
    this.get('layoutCoordinator').checkDrag(event, this);
  }
});
