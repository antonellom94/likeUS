/**
 * @api {post} /faceRec 
 * @apiVersion 1.0.0
 * @apiName facerec
 * @apiGroup likeUs
 *
 * @apiParam (Request body) {String} first First image in base64 encoding.
 * @apiParam (Request body) {String} second Second image in base64 encoding.
 * 
 * @apiParamExample {json} Request-Example:
 *                  { "first": "image in base64 encoding",
 *                    "second": "image in base64 encoding" } 
 * 
 * @apiSuccess {String} result Result image in base64 encoding.
 * @apiSuccess {Boolean} processed Images processed, kinda useless.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": "image in base64 encoding",
 *       "processed": true
 *     }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     HTTP/1.1 500 Internal Server Error
 *     
 */