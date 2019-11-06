
variable "api_token" {}

variable "org_name" {}

variable "base_url" {}

variable "redirect_uri" {}

provider "okta" {
  api_token = var.api_token
  org_name = var.org_name
  base_url = var.base_url
}

resource okta_group gold_subscribers {
  name = "gold subscribers"
}

resource okta_group silver_subscribers {
  name = "silver subscribers"
}

resource "okta_user" "carl_sagan" {
  first_name = "carl"
  last_name  = "sagan"
  email      = "carl.sagan@mailinator.com"
  login      = "carl.sagan@mailinator.com"
  group_memberships      = ["${okta_group.silver_subscribers.id}"]
}

resource "okta_user" "jodie_foster" {
  first_name = "jodie"
  last_name  = "foster"
  email      = "jodie.foster@mailinator.com"
  login      = "jodie.foster@mailinator.com"
  group_memberships      = ["${okta_group.silver_subscribers.id}", "${okta_group.gold_subscribers.id}"]
}

data okta_group everyone {
  name = "Everyone"
}

data okta_auth_server default {
  name = "default"
}

resource okta_auth_server_scope gold {
  auth_server_id   = "${data.okta_auth_server.default.id}"
  metadata_publish = "NO_CLIENTS"
  name             = "http://myapp.com/scp/gold"
  consent          = "IMPLICIT"
}

resource okta_auth_server_scope silver {
  auth_server_id   = "${data.okta_auth_server.default.id}"
  metadata_publish = "NO_CLIENTS"
  name             = "http://myapp.com/scp/silver"
  consent          = "IMPLICIT"
}

resource "okta_auth_server_policy" "solar_system_access" {
  status           = "ACTIVE"
  name             = "solar system access"
  description      = "solar system access"
  priority         = 1
  client_whitelist = ["ALL_CLIENTS"]
  auth_server_id   = "${data.okta_auth_server.default.id}"
}

resource "okta_auth_server_policy_rule" "silver_access" {
  auth_server_id       = "${data.okta_auth_server.default.id}"
  policy_id            = "${okta_auth_server_policy.solar_system_access.id}"
  status               = "ACTIVE"
  name                 = "silver access"
  priority             = 2
  group_whitelist      = ["${okta_group.silver_subscribers.id}"]
  grant_type_whitelist = ["authorization_code"]
  scope_whitelist      = ["openid", "${okta_auth_server_scope.silver.name}"]
}

resource "okta_auth_server_policy_rule" "gold_access" {
  auth_server_id       = "${data.okta_auth_server.default.id}"
  policy_id            = "${okta_auth_server_policy.solar_system_access.id}"
  status               = "ACTIVE"
  name                 = "gold access"
  priority             = 1
  group_whitelist      = ["${okta_group.gold_subscribers.id}"]
  grant_type_whitelist = ["authorization_code"]
  scope_whitelist      = ["openid", "${okta_auth_server_scope.silver.name}", "${okta_auth_server_scope.gold.name}"]
}

resource okta_app_oauth solar_system_client {
  label = "solar system client"
  type  = "web"

  grant_types = [
    "authorization_code",
    "implicit"
  ]

  response_types = [
    "id_token",
    "code"
  ]

  redirect_uris             = ["http://localhost:8080"]
  post_logout_redirect_uris = ["http://localhost:8080"]
  login_uri                 = "http://localhost:8080"
  groups                    = ["${okta_group.gold_subscribers.id}", "${okta_group.silver_subscribers.id}"]
}
