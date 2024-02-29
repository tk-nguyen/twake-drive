function "generate_tags" {
  params = [image, tags]
  result = formatlist("%s:%s", image, tags)
}

target "docker-metadata-action" {}

target "_common" {
  platforms = ["linux/amd64", "linux/arm64"]
  context = "tdrive"
  labels = target.docker-metadata-action.labels
  annotations = target.docker-metadata-action.annotations
}

target "backend" {
  inherits = ["_common"]
  dockerfile = "docker/tdrive-node/Dockerfile"
  target = "production"
  tags = concat(
    generate_tags("ghcr.io/tk-nguyen/twake-drive/tdrive-node", target.docker-metadata-action.tags),
    generate_tags("registry.gitlab.com/tknguyen/demo-docker/tdrive-node", target.docker-metadata-action.tags),
  )
}

target "frontend" {
  inherits = ["_common"]
  dockerfile = "docker/tdrive-frontend/Dockerfile"
  tags = concat(
    generate_tags("ghcr.io/tk-nguyen/twake-drive/tdrive-frontend", target.docker-metadata-action.tags),
    generate_tags("registry.gitlab.com/tknguyen/demo-docker/tdrive-frontend", target.docker-metadata-action.tags),
  )
}

target "onlyoffice-connector" {
  inherits = ["_common"]
  dockerfile = "docker/onlyoffice-connector/Dockerfile"
  tags = concat(
    generate_tags("ghcr.io/tk-nguyen/twake-drive/onlyoffice-connector", target.docker-metadata-action.tags),
    generate_tags("registry.gitlab.com/tknguyen/demo-docker/onlyoffice-connector", target.docker-metadata-action.tags),
  )
}
target "ldap-sync" {
  inherits = ["_common"]
  dockerfile = "docker/tdrive-ldap-sync/Dockerfile"
  tags = concat(
    generate_tags("ghcr.io/tk-nguyen/twake-drive/tdrive-ldap-sync", target.docker-metadata-action.tags),
    generate_tags("registry.gitlab.com/tknguyen/demo-docker/tdrive-ldap-sync", target.docker-metadata-action.tags),
  )
}
target "nextcloud-migration" {
  inherits = ["_common"]
  dockerfile = "docker/tdrive-nextcloud-migration/Dockerfile"
  tags = concat(
    generate_tags("ghcr.io/tk-nguyen/twake-drive/tdrive-nextcloud-migration", target.docker-metadata-action.tags),
    generate_tags("registry.gitlab.com/tknguyen/demo-docker/tdrive-nextcloud-migration", target.docker-metadata-action.tags),
  )
}
