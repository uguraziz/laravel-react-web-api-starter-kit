<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_the_api_login_returns_validation_errors(): void
    {
        $response = $this->postJson('/api/login');

        $response->assertStatus(422);
    }
}
