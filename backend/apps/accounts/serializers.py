"""Auth & user serializers."""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'role', 'password', 'password_confirm']

    def validate_role(self, value):
        # Users can only self-register as candidate or company_admin
        if value not in ('candidate', 'company_admin'):
            raise serializers.ValidationError('Invalid registration role.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    is_pro = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'avatar', 'is_email_verified', 'is_onboarded', 'created_at',
            'notify_new_apps', 'notify_ai_match', 'notify_messages',
            'mfa_enabled', 'is_pro'
        ]
        read_only_fields = ['id', 'email', 'role', 'is_email_verified', 'is_onboarded', 'created_at', 'mfa_enabled', 'is_pro']

    def get_is_pro(self, obj):
        company = None
        if obj.role == 'company_admin':
            company = obj.owned_companies.first()
        elif obj.role == 'recruiter' and hasattr(obj, 'recruiter_profile'):
            company = obj.recruiter_profile.company
            
        if company and hasattr(company, 'subscription'):
            return company.subscription.is_pro_or_higher
        return False


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])

    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError('Wrong password.')
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(validators=[validate_password])
