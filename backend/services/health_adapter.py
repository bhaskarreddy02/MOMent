"""
Health Data Integration Layer.
Architecture pattern:
HealthDataProvider (Abstract Base)
 ├── MockHealthProvider (High-fidelity Apple HealthKit / Health Connect simulator)
 ├── HealthKitProvider (iOS native adapter interface)
 └── HealthConnectProvider (Android native adapter interface)
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime, timedelta

class HealthDataProvider(ABC):
    @abstractmethod
    def get_recent_metrics(self) -> Dict[str, Any]:
        """Fetch steps, sleep, resting heart rate, and maternal weight trends."""
        pass

class MockHealthKitProvider(HealthDataProvider):
    """
    Realistic Apple HealthKit & Health Connect simulation.
    Captures third-trimester physiological shifts:
    - Step count averaging 5,800 steps/day
    - Sleep fragmentation (6.8 hrs/night, increased wake intervals)
    - Resting heart rate elevated to ~78-82 bpm (normal blood volume expansion)
    - Weight progression: 158.4 lbs (+24.2 lbs total gain from pre-pregnancy 134.2 lbs)
    """
    def __init__(self):
        self.device_source = "Apple Watch Series 9 via Apple HealthKit (Sync: 12 mins ago)"
        self.battery_status = "94%"
        self.connected = True

    def get_recent_metrics(self) -> Dict[str, Any]:
        today = datetime.now()
        
        # 7-day daily time-series
        daily_trends = []
        for i in range(7):
            day_date = today - timedelta(days=(6 - i))
            day_str = day_date.strftime("%a %b %d")
            
            # Subtle physiological patterns for week 31
            steps = [5420, 6120, 4890, 6300, 5842, 5100, 5842][i]
            sleep_hours = [7.2, 6.5, 6.8, 7.0, 6.4, 5.8, 6.7][i]
            resting_hr = [78, 80, 79, 82, 81, 82, 80][i]
            bp_systolic = [128, 130, 134, 132, 130, 132, 131][i]
            bp_diastolic = [82, 84, 86, 84, 82, 84, 83][i]
            
            daily_trends.append({
                "date": day_str,
                "short_date": day_date.strftime("%m/%d"),
                "steps": steps,
                "sleep_hours": sleep_hours,
                "resting_hr": resting_hr,
                "bp_systolic": bp_systolic,
                "bp_diastolic": bp_diastolic
            })

        return {
            "provider_name": "HealthKit Provider (iOS HealthKit / Health Connect)",
            "device_source": self.device_source,
            "connected": self.connected,
            "last_synced": "Just now",
            "today_summary": {
                "steps": 5842,
                "steps_target": 7000,
                "sleep_duration": "7h 12m",
                "sleep_quality_score": "Fair (3 awakenings logged)",
                "deep_sleep_mins": 58,
                "rem_sleep_mins": 94,
                "resting_heart_rate": 80,
                "hr_baseline": "72 bpm (pre-pregnancy)",
                "current_weight_lbs": 158.4,
                "weekly_weight_change": "+0.8 lbs (Within IOM target 0.5-1.0 lb/wk)"
            },
            "seven_day_trends": daily_trends,
            "clinical_observations": [
                "Sleep duration dipped to 5.8 hours on Dec 10, correlating with reported mild frontal tension headache.",
                "Resting heart rate remains stable within gestational physiological target range (78-82 bpm).",
                "Average daily step volume (5,644 steps) aligns with moderate physical activity guidelines."
            ]
        }

class HealthKitProvider(HealthDataProvider):
    """Native iOS HealthKit Bridge Placeholder."""
    def get_recent_metrics(self) -> Dict[str, Any]:
        raise NotImplementedError("HealthKit native framework bridge requires native iOS container.")

class HealthConnectProvider(HealthDataProvider):
    """Native Android Health Connect Bridge Placeholder."""
    def get_recent_metrics(self) -> Dict[str, Any]:
        raise NotImplementedError("Health Connect Android API requires native Android runtime.")
