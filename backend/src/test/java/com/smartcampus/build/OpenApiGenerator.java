package com.smartcampus.build;

import com.smartcampus.backend.BackendApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.server.context.WebServerApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

/** Exports the OpenAPI document using the application's test profile. */
public final class OpenApiGenerator {

    private OpenApiGenerator() {
    }

    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            throw new IllegalArgumentException("Expected the OpenAPI output path");
        }

        Path output = Path.of(args[0]);
        Files.createDirectories(output.getParent());
        Files.deleteIfExists(output);

        try (ConfigurableApplicationContext context = new SpringApplicationBuilder(BackendApplication.class)
                .profiles("test")
                .run("--server.port=0")) {
            int port = ((WebServerApplicationContext) context).getWebServer().getPort();
            HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/v3/api-docs"))
                    .timeout(Duration.ofSeconds(30))
                    .GET()
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() != 200) {
                throw new IllegalStateException("OpenAPI endpoint returned HTTP " + response.statusCode()
                        + ": " + response.body());
            }

            ObjectMapper mapper = new ObjectMapper();
            ObjectNode document = (ObjectNode) mapper.readTree(response.body());
            if (!document.has("openapi") || !document.has("paths")) {
                throw new IllegalStateException("OpenAPI endpoint returned an invalid document");
            }
            document.remove("servers"); // The temporary web server has a different port on every build.
            Files.writeString(output,
                    mapper.writerWithDefaultPrettyPrinter().writeValueAsString(document) + System.lineSeparator(),
                    StandardCharsets.UTF_8);
            System.out.println("Generated OpenAPI: " + output.toAbsolutePath());
        }
    }
}
