package com.smartcampus.backend.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger / OpenAPI setup shared by every module.
 *
 *   Swagger UI : http://localhost:8080/swagger-ui.html
 *   JSON spec  : http://localhost:8080/v3/api-docs
 *
 * Declares the "bearerAuth" scheme so the "Authorize" button in Swagger UI
 * can send the JWT. Controllers that need a JWT add
 * {@code @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)}.
 */
@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI smartCampusOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Campus API")
                        .version("v1")
                        .description("""
                                Backend API of the Smart Campus online learning platform (CO3103).
                                Every response uses the envelope {success, data, error_code, error_message}.
                                Log in with POST /api/auth/login, then click "Authorize" and paste the access token.
                                """))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT returned by POST /api/auth/login (paste the token only, without 'Bearer ')")));
    }
}
