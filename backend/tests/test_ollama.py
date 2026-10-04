from backend.app.services.ollama_service import ollama_service

def test_ollama_status_endpoint(client):
    response = client.get("/api/ollama/status")
    assert response.status_code == 200
    data = response.json()
    assert "connected" in data
    assert "model" in data
    assert "available" in data
    assert "status_text" in data

def test_ollama_json_recovery_utility():
    # Test markdown fenced JSON
    markdown_sample = "Here is the result:\n```json\n{\"product_name\": \"Test Shampoo\", \"category\": \"cosmetics\", \"ingredients\": [\"Glycerin\"]}\n```\nHope that helps!"
    extracted = ollama_service.extract_json_from_text(markdown_sample)
    assert extracted is not None
    assert extracted["product_name"] == "Test Shampoo"
    assert extracted["ingredients"] == ["Glycerin"]

    # Test trailing comma recovery
    trailing_comma_sample = "{\"product_name\": \"Soap\", \"ingredients\": [\"Water\", \"Salt\",],}"
    recovered = ollama_service.extract_json_from_text(trailing_comma_sample)
    assert recovered is not None
    assert recovered["product_name"] == "Soap"

    # Test invalid content gracefully returns None
    invalid = ollama_service.extract_json_from_text("Sorry, I could not read this label.")
    assert invalid is None
