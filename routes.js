
const { exec } = require('child_process')

var fs = require('fs')

var request = require("request")

///////////////////////////////////////////////////

module.exports = function (app) {

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
								if (process.env.env != "localhost") {
									fs.unlinkSync('terraform.tfstate')
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
