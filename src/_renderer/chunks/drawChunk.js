(function () {

    "use strict";

    xeogl.renderer.ChunkFactory.createChunkType({

        type: "draw",

        // As we apply a list of state chunks in a {@link xeogl.renderer.Renderer},
        // we track the ID of each chunk in order to avoid redundantly re-applying
        // the same chunk. We don't want that for draw chunks however, because
        // they contain drawElements calls, which we need to do for each object.

        unique: true,

        build: function () {
            this._uPickColorObject = this.program.pickObject.getUniform("pickColor");
        },

        draw: function (frameCtx) {
            var state = this.state;
            var gl = this.program.gl;

            if (state.indices) {
                gl.drawElements(state.primitive, state.indices.numItems, state.indices.itemType, 0);
                frameCtx.drawElements++;

            } else if (state.positions) {
                gl.drawArrays(gl.TRIANGLES, 0, state.positions.numItems);
            }
        },

        shadow: function (frameCtx) {
            var state = this.state;
            var gl = this.program.gl;

            if (state.indices) {
                gl.drawElements(state.primitive, state.indices.numItems, state.indices.itemType, 0);
                frameCtx.drawElements++;

            } else if (state.positions) {
                gl.drawArrays(state.primitive, 0, state.positions.numItems);
            }
        },

        pickObject: function (frameCtx) {

            var state = this.state;
            var gl = this.program.gl;

            if (this._uPickColorObject) {

                frameCtx.pickObjectIndex++;

                var b = frameCtx.pickObjectIndex >> 16 & 0xFF;
                var g = frameCtx.pickObjectIndex >> 8 & 0xFF;
                var r = frameCtx.pickObjectIndex & 0xFF;

                this._uPickColorObject.setValue([r / 255, g / 255, b / 255, 1]);
            }

            if (state.indices) {
                gl.drawElements(state.primitive, state.indices.numItems, state.indices.itemType, 0);

            } else if (state.positions) {
                gl.drawArrays(state.primitive, 0, state.positions.numItems);
            }
        },

        pickPrimitive: function () {

            var state = this.state;
            var gl = this.program.gl;

            var pickPositions = state.getPickPositions();

            if (pickPositions) {
                gl.drawArrays(state.primitive, 0, pickPositions.numItems);
            }
        },

        outline: function(frameCtx) {
            this.draw(frameCtx);
        }
    });

})();
