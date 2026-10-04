def test_preferences_lifecycle(client):
    # 1. Get initial preferences
    get_res = client.get("/api/preferences")
    assert get_res.status_code == 200
    initial = get_res.json()
    assert "fragrance" in initial
    assert "skin_irritation" in initial
    assert "custom_avoidances" in initial

    # 2. Update preferences
    update_payload = {
        "skin_irritation": True,
        "fragrance": True,
        "allergens": False,
        "food_additives": True,
        "environmental_impact": False,
        "children_exposure": True,
        "general_information": True,
        "custom_avoidances": ["parabens", "artificial dye"],
        "notes": "Sensitive scalp testing"
    }
    put_res = client.put("/api/preferences", json=update_payload)
    assert put_res.status_code == 200
    res_data = put_res.json()
    assert res_data["success"] is True
    assert res_data["preferences"]["fragrance"] is True
    assert "parabens" in res_data["preferences"]["custom_avoidances"]

    # 3. Verify persistence
    verify_res = client.get("/api/preferences")
    assert verify_res.status_code == 200
    verified = verify_res.json()
    assert verified["fragrance"] is True
    assert verified["skin_irritation"] is True
    assert "parabens" in verified["custom_avoidances"]
