import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('card-drop-targets', 'Integration | Component | card drop targets', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{card-drop-targets}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#card-drop-targets}}
      template block text
    {{/card-drop-targets}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
