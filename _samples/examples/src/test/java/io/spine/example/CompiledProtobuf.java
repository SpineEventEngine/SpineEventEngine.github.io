package io.spine.example;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.google.common.truth.Truth.assertThat;

@DisplayName("Project should contain Protobuf types:")
class CompiledProtobuf {

    @Test
    @DisplayName("ProjectCreated")
    void projectCreated() {
        assertThat(ProjectCreated.class)
                .isNotNull();
    }
}
