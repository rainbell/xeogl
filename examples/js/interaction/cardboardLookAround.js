/**
 A **CardboardLookAround** handles device orientation events and causes a Camera to look around while fixed in one place.

 ## Usage

 Stereo view of an Entity with CardboardLookAround control:

 ````javascript
 new XEO.Entity({
     geometry: new XEO.BoxGeometry()
 });

 new Stereo();

 new XEO.CardboardLookAround();
 ````

 Stereo view of an Entity with CardboardLookAround control, using custom Camera and Viewport:

 ````javascript
 var camera = new XEO.Camera({
     view: new XEO.Lookat({
         eye: [0, 0, 10],
         look: [0, 0, 0],
         up: [0, 1, 0]
     }),
     project: new XEO.Perspective({
         fovy: 60,
         near: 0.1,
         far: 1000
     })
 });

 var viewport = new XEO.Viewport();

 var entity = new XEO.Entity({
     camera: camera,
     viewport: viewport,
     geometry: new XEO.BoxGeometry()
 });

 new XEO.Stereo({
     camera: camera,
     viewport: viewport
 });

 new XEO.CardboardLookAround({
     camera: camera,
     active: true // Default
 });
 ````

 @class CardboardLookAround
 @module XEO
 @submodule interaction
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this CardboardLookAround in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this CardboardLookAround.
 @param [cfg.camera] {String|Camera} ID or instance of a {{#crossLink "Camera"}}Camera{{/crossLink}} for this CardboardLookAround.
 Must be within the same {{#crossLink "Scene"}}Scene{{/crossLink}} as this CardboardLookAround. Defaults to the
 parent {{#crossLink "Scene"}}Scene{{/crossLink}}'s default instance, {{#crossLink "Scene/camera:property"}}camera{{/crossLink}}.
 @param [cfg.active=true] {Boolean} Whether or not this CardboardLookAround is active.
 @extends CameraController
 */
(function () {

    "use strict";

    XEO.CardboardLookAround = XEO.CameraController.extend({

        type: "XEO.CardboardLookAround",

        _init: function (cfg) {

            this._super(cfg);

            var input = this.scene.input;
            var handle;
            var math = XEO.math;
            var tempVec3a = math.vec3();
            var tempVec3b = math.vec3();
            var tempMat3 = math.mat4();
            var tempMat3b = math.mat4();

            var self = this;

            // ---------- TESTING -----------------------------------
            var alpha = 0;
            var beta = -90;
            var gamma = 0;

            this.scene.on("tick", function () {
                self.scene.input.fire("deviceorientation", {
                    alpha: alpha += 0.1,
                    beta: beta += 0.0,
                    gamma: gamma += 0.0
                });
            });

            self.on("active",
                function (active) {
                    if (active) {

                        handle = input.on("deviceorientation",
                            function (e) {

                                var lookat = self.camera.view;

                                // Create rotation matrix from Z-X'-Y' angles

                                math.identityMat4(tempMat3);

                                math.mulMat4(tempMat3, math.rotationMat4c(e.gamma * math.DEGTORAD, 0, 0, 1, tempMat3b)); // Z
                                math.mulMat4(tempMat3, math.rotationMat4c(e.alpha * math.DEGTORAD, 1, 0, 0, tempMat3b)); // X
                                math.mulMat4(tempMat3, math.rotationMat4c(-e.beta * math.DEGTORAD, 0, 1, 0, tempMat3b)); // Y

                                // Rotate Camera look about eye by the matrix

                                tempVec3b[0] = 0;
                                tempVec3b[1] = 0;
                                tempVec3b[2] = -Math.abs(math.lenVec3(math.subVec3(lookat.look, lookat.eye, tempVec3a)));

                                lookat.look = math.addVec3(math.transformVec3(tempMat3, tempVec3b, tempVec3b), lookat.eye);

                                // Up

                                tempVec3b[0] = 0;
                                tempVec3b[1] = 1;
                                tempVec3b[2] = 0;

                                lookat.up = math.transformVec3(tempMat3, tempVec3b, tempVec3b);
                            });

                    } else {
                        input.off(handle);
                    }
                });
        }
    });
})();