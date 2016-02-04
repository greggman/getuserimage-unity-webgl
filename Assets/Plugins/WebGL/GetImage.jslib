/*
 * Copyright 2016, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var getImage = {
    getImageFromBrowser: function(objectNamePtr, funcNamePtr) {
      // Because unity is currently bad at JavaScript we can't use standard
      // JavaScript idioms like closures so we have to use global variables :(
      window.becauseUnitysBadWithJavacript_getImageFromBrowser =
          window.becauseUnitysBadWithJavacript_getImageFromBrowser || {
         busy: false,
         initialized: false,
         rootDisplayStyle: null,  // style to make root element visible
         root_: null,             // root element of form
         ctx_: null,              // canvas for getting image data;
      };
      var g = window.becauseUnitysBadWithJavacript_getImageFromBrowser;
      if (g.busy) {
          // Don't let multiple requests come in
      }
      g.busy = true;

      var objectName = Pointer_stringify(objectNamePtr);
      var funcName = Pointer_stringify(funcNamePtr);

      if (!g.initialized) {
          g.initialized = true;
          g.ctx = window.document.createElement("canvas").getContext("2d");

          // Append a form to the page (more self contained than editing the HTML?)
          g.root = window.document.createElement("div");
          g.root.innerHTML = [
            '<div style="                                               ',
            '    position: absolute;                                    ',
            '    left: 0;                                               ',
            '    top: 0;                                                ',
            '    width: 100%;                                           ',
            '    height: 100%;                                          ',
            '    display: -webkit-flex;                                 ',
            '    display: flex;                                         ',
            '    -webkit-flex-flow: column;                             ',
            '    flex-flow: column;                                     ',
            '    -webkit-justify-content: center;                       ',
            '    -webkit-align-content: center;                         ',
            '    -webkit-align-items: center;                           ',
            '                                                           ',
            '    justify-content: center;                               ',
            '    align-content: center;                                 ',
            '    align-items: center;                                   ',
            '                                                           ',
            '    z-index: 2;                                            ',
            '    color: white;                                          ',
            '    background-color: rgba(0,0,0,0.8);                     ',
            '    font: sans-serif;                                      ',
            '    font-size: large;                                      ',
            '">                                                         ',
            '    <div>                                                  ',
            '      <label for="photo">click to choose an image:</label> ',
            '      <input id="photo" type="file" accept="image/*"/>     ',
            '    </div>                                                 ',
            '</div>                                                     ',
          ].join('\n');
          var input = g.root.querySelector("input");
          input.addEventListener('change', getPic);
          //           input.addEventListener('cancel') // TBD

          g.rootDisplayStyle = g.root.style.display;
          window.document.body.appendChild(g.root);
      }

      // make it visible
      g.root.style.display = g.rootDisplayStyle;

      function getPic(evt) {
          var fileInput = evt.target.files;
          if (!fileInput || !fileInput.length) {
              return sendError("no image selected");
          }

          var picURL = window.URL.createObjectURL(fileInput[0]);
          var img = new window.Image();
          img.addEventListener('load', handleImageLoad);
          img.addEventListener('error', handleImageError);
          img.src = picURL;
      }

      function handleImageError(evt) {
          sendError("Could not get image");
      }

      function handleImageLoad(evt) {
          var img = evt.target;
          window.URL.revokeObjectURL(img.src);
          // We probably don't want the fullsize image. It might be 3000x2000 pixels or something too big
          g.ctx.canvas.width  = 256;
          g.ctx.canvas.height = 256;
          g.ctx.drawImage(img, 0, 0, g.ctx.canvas.width, g.ctx.canvas.height);

          var dataUrl = g.ctx.canvas.toDataURL();

          // free the canvas memory (could probably be zero)
          g.ctx.canvas.width  = 1;
          g.ctx.canvas.height = 1;

          sendResult(dataUrl);
          g.busy = false;
      }

      function sendError(msg) {
          sendResult("error: " + msg);
      }

      function hide() {
          g.root.style.display = "none";
      }

      function sendResult(result) {
          hide();
          g.busy = false;
          SendMessage(objectName, funcName, result);
      }
    },
};

mergeInto(LibraryManager.library, getImage);


