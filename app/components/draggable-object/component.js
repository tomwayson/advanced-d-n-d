import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  classNames:['draggable'],
  attributeBindings:['draggable'],
  draggable:true,
  dragType: 'add',
  objectType: 'card',
  action:'add-card',
  eventBus: Ember.inject.service('event-bus'),

  dragStart(event){
    const dragType = this.get('dragType');
    const objectType = this.get('objectType');
    console.log('DRAGGABLE-OBJECT Start for  ' + objectType);
    // set the drag properties on the event bus
    this.set('eventBus.transferData', {
      dragType: dragType,
      objectType: objectType,
      // default action based on drag/object type
      action: dragType + '-' + objectType,
      model: this.get('model')
    });

    // let paret know that we've started dragging
    this.sendAction('onDragStart');
  }
});
