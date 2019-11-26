
const { exec } = require('child_process')

var fs = require('fs')

var request = require("request")

///////////////////////////////////////////////////

module.exports = function (app) {


	app.get('/', function(req, res, next) {
		res.json({message: "NGINX is successfully proxying Node Express."})
	})

	app.post('/apply', function(req, res, next) {

		console.dir(req.body)

		cmd_init = "terraform init -input=false"

		cmd_apply = "terraform apply -input=false -auto-approve"

		cmd_apply += " -var 'api_token=" + req.body.okta_api_token + "'"

		cmd_apply += " -var 'org_name=" + req.body.okta_org_name + "'"

		cmd_apply += " -var 'base_url=" + req.body.okta_base_url + "'"

		cmd_apply += " -var 'redirect_uri=" + req.body.redirect_uri + "'"

		exec(cmd_init, (err, stdout, stderr) => {
			if (err || stderr) {
				if (stderr) {
					console.error(stderr)
					res.json({error: stderr})
					return
				}
				else {
					console.error(err)
					res.json({error: err})
					return
				}
			} else {
				exec(cmd_apply, (err, stdout, stderr) => {
					if (err || stderr) {
						if (stderr) {
							console.error(stderr)

							res.json({
								error: 'terraform_error',
								error_msg: stderr
							})

							return
						}
						else {
							console.error(err)
							res.json({error: err})
							return
						}
					} else {

						fs.readFile('terraform.tfstate', 'utf8', function(err, tfstate) {

							try {
								if (process.env.MODE != "test") {
									// fs.unlinkSync('terraform.tfstate')

									var okta_tenant = req.body.okta_org_name + "." + req.body.okta_base_url

									var new_path = 'success/' + okta_tenant + '/terraform.tfstate'

									fs.renameSync('terraform.tfstate', new_path)

								}
								res.json(JSON.parse(tfstate))

								console.dir(JSON.parse(tfstate))
							} catch(err) {
								console.error(err)
								res.json({error: err})
							}
						})
					}
				})
			}
		})
	})
}
