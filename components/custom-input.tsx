import React, { forwardRef, useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import "../global.css";

interface CustomInputProps extends TextInputProps {
  icon: React.ComponentType<any>;
  label: string;
  optional?: boolean;
  secure?: boolean;
  value: string;
  onChangeText?: (text: string) => void;
  isValid: boolean;
  isTouched: boolean;
  onPress?: () => void;
  errorMessage?: string;
}

const CustomInput = forwardRef<TextInput, CustomInputProps>(
  (
    {
      icon: Icon,
      label,
      optional,
      secure,
      value,
      onChangeText,
      isValid,
      isTouched,
      onPress,
      errorMessage,
      onFocus,
      ...rest
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const getBorderColor = () => {
      if (!isTouched) {
        return "border-gray-300 dark:border-gray-700";
      }
      return isValid ? "border-green-500" : "border-red-500";
    };

    const getIconColor = () => {
      if (isTouched && !isValid) {
        return "#EF4444";
      }
      return "#94A3B8";
    };

    const inputContent = (
      <View
        className={`flex-row items-center border-2 rounded-xl px-4 h-16 bg-white dark:bg-gray-800 ${getBorderColor()}`}
      >
        <Icon size={24} color={getIconColor()} strokeWidth={1.5} />
        {onPress ? (
          <Text
            className={`flex-1 p-0 ml-4 font-manrope text-2xl ${
              value ? "text-gray-500 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {value}
          </Text>
        ) : (
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secure && !isPasswordVisible}
            className="flex-1 h-full p-0 ml-4 font-manrope text-2xl text-gray-500 dark:text-gray-300"
            placeholderTextColor="#94A3B8"
            style={{
              textAlignVertical: "center",
              includeFontPadding: false,
            }}
            onFocus={onFocus}
            autoCapitalize="none"
            {...rest}
          />
        )}
        {secure && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? (
              <EyeOff size={24} color="#94A3B8" />
            ) : (
              <Eye size={24} color="#94A3B8" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );

    return (
      <View className="w-full mb-6">
        <Text className="text-gray-500 dark:text-gray-400 font-semibold text-center text-[18px] mb-2">
          {label}{" "}
          {optional ? (
            <Text className="text-gray-400 dark:text-gray-500">(optionnel)</Text>
          ) : (
            <Text className="text-secondary">*</Text>
          )}
        </Text>
        {onPress ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            {inputContent}
          </TouchableOpacity>
        ) : (
          inputContent
        )}
        {isTouched && !isValid && errorMessage && (
          <Text className="text-red-400 text-sm mt-1 text-center">
            {errorMessage}
          </Text>
        )}
      </View>
    );
  }
);

export default CustomInput;
